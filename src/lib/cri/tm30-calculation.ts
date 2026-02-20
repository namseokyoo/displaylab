/**
 * IES TM-30-20 Calculation
 *
 * Implements simplified Fidelity Index (Rf) and Gamut Index (Rg).
 *
 * TM-30-20 is the modern replacement for CRI, using:
 * - 99 Color Evaluation Samples (CES) instead of 14 TCS
 * - CIELAB color difference (CIEDE2000) instead of CIE 1964 W*U*V*
 * - Fidelity Index (Rf) for overall color accuracy
 * - Gamut Index (Rg) for gamut area relative to reference
 * - 16 hue-angle bins for color vector graphic
 *
 * NOTE: Full TM-30 requires the exact 99 CES spectral reflectance data.
 * This implementation uses a representative subset of spectral reflectances
 * distributed across 16 hue bins. The Rf and Rg values are approximate.
 *
 * Reference: IES TM-30-20 "IES Method for Evaluating Light Source
 * Color Rendition"
 */

import { interpolateObserver } from '@/lib/cie';
import { calculateCCT } from '@/lib/cct';
import { xyzToLab } from '@/lib/color-convert';
import { deltaE2000 } from '@/lib/delta-e';
import type { SpectrumPoint, XYZColor, LabColor } from '@/types';
import { getReferenceIlluminant } from './cri-reference-illuminants';

// ============================================================
// TM-30 Result Types
// ============================================================

export interface TM30Result {
  /** Fidelity Index (Rf): 0-100, 100 = perfect fidelity */
  Rf: number;
  /** Gamut Index (Rg): 100 = same gamut as reference, >100 = larger, <100 = smaller */
  Rg: number;
  /** CCT of test source */
  cct: number;
  /** Per-bin fidelity (Rfi for each of 16 hue bins) */
  binRf: number[];
  /** Per-bin hue shift (positive = clockwise shift in a*b* plane) */
  binHueShift: number[];
  /** Per-bin chroma change ratio (1.0 = same, >1 = more saturated, <1 = less) */
  binChromaChange: number[];
  /** Color vector data for the 16 bins (reference and test a*b* coordinates) */
  colorVectors: Array<{
    bin: number;
    hueAngle: number;
    refA: number;
    refB: number;
    testA: number;
    testB: number;
  }>;
}

// ============================================================
// Approximate CES (Color Evaluation Samples)
// ============================================================

/**
 * Generate 99 approximate Color Evaluation Samples distributed
 * across the 16 hue bins of TM-30.
 *
 * Each CES is defined by its approximate spectral reflectance.
 * The samples are spread across hue angles to cover the full gamut.
 *
 * Hue bins (16 bins, 22.5 degrees each):
 * Bin 1: 0-22.5 (red)
 * Bin 2: 22.5-45 (red-orange)
 * ...
 * Bin 16: 337.5-360 (pink-red)
 */
interface CESDefinition {
  bin: number; // 1-16 hue bin
  peaks: Array<{ center: number; width: number; height: number }>;
  base: number;
}

function generateCESReflectance(def: CESDefinition): number[] {
  const result: number[] = [];
  for (let i = 0; i < 81; i++) {
    const wl = 380 + i * 5;
    let value = def.base;
    for (const peak of def.peaks) {
      const dist = (wl - peak.center) / peak.width;
      value += peak.height * Math.exp(-0.5 * dist * dist);
    }
    result.push(Math.max(0.01, Math.min(0.99, value)));
  }
  return result;
}

/**
 * Generate the 99 CES definitions distributed across 16 hue bins.
 * ~6 samples per bin for even coverage.
 */
function generateCESDefinitions(): CESDefinition[] {
  const definitions: CESDefinition[] = [];

  // Bin 1 (0-22.5): Red hues
  definitions.push({ bin: 1, base: 0.08, peaks: [{ center: 650, width: 50, height: 0.40 }] });
  definitions.push({ bin: 1, base: 0.10, peaks: [{ center: 640, width: 45, height: 0.35 }] });
  definitions.push({ bin: 1, base: 0.06, peaks: [{ center: 660, width: 55, height: 0.45 }] });
  definitions.push({ bin: 1, base: 0.12, peaks: [{ center: 645, width: 40, height: 0.30 }] });
  definitions.push({ bin: 1, base: 0.09, peaks: [{ center: 655, width: 50, height: 0.38 }] });
  definitions.push({ bin: 1, base: 0.07, peaks: [{ center: 635, width: 60, height: 0.42 }] });

  // Bin 2 (22.5-45): Red-Orange
  definitions.push({ bin: 2, base: 0.08, peaks: [{ center: 620, width: 50, height: 0.38 }] });
  definitions.push({ bin: 2, base: 0.10, peaks: [{ center: 615, width: 45, height: 0.35 }] });
  definitions.push({ bin: 2, base: 0.06, peaks: [{ center: 625, width: 55, height: 0.40 }] });
  definitions.push({ bin: 2, base: 0.12, peaks: [{ center: 610, width: 50, height: 0.32 }] });
  definitions.push({ bin: 2, base: 0.09, peaks: [{ center: 618, width: 48, height: 0.36 }] });
  definitions.push({ bin: 2, base: 0.07, peaks: [{ center: 630, width: 55, height: 0.42 }] });

  // Bin 3 (45-67.5): Orange
  definitions.push({ bin: 3, base: 0.08, peaks: [{ center: 595, width: 50, height: 0.42 }] });
  definitions.push({ bin: 3, base: 0.10, peaks: [{ center: 590, width: 45, height: 0.38 }] });
  definitions.push({ bin: 3, base: 0.06, peaks: [{ center: 600, width: 55, height: 0.45 }] });
  definitions.push({ bin: 3, base: 0.12, peaks: [{ center: 588, width: 50, height: 0.35 }] });
  definitions.push({ bin: 3, base: 0.09, peaks: [{ center: 598, width: 48, height: 0.40 }] });
  definitions.push({ bin: 3, base: 0.07, peaks: [{ center: 592, width: 52, height: 0.43 }] });

  // Bin 4 (67.5-90): Yellow-Orange
  definitions.push({ bin: 4, base: 0.10, peaks: [{ center: 580, width: 50, height: 0.45 }] });
  definitions.push({ bin: 4, base: 0.12, peaks: [{ center: 575, width: 48, height: 0.42 }] });
  definitions.push({ bin: 4, base: 0.08, peaks: [{ center: 585, width: 55, height: 0.48 }] });
  definitions.push({ bin: 4, base: 0.14, peaks: [{ center: 572, width: 45, height: 0.38 }] });
  definitions.push({ bin: 4, base: 0.11, peaks: [{ center: 578, width: 50, height: 0.44 }] });
  definitions.push({ bin: 4, base: 0.09, peaks: [{ center: 582, width: 52, height: 0.46 }] });

  // Bin 5 (90-112.5): Yellow
  definitions.push({ bin: 5, base: 0.10, peaks: [{ center: 565, width: 55, height: 0.48 }] });
  definitions.push({ bin: 5, base: 0.12, peaks: [{ center: 560, width: 50, height: 0.45 }] });
  definitions.push({ bin: 5, base: 0.08, peaks: [{ center: 570, width: 60, height: 0.50 }] });
  definitions.push({ bin: 5, base: 0.14, peaks: [{ center: 558, width: 48, height: 0.42 }] });
  definitions.push({ bin: 5, base: 0.11, peaks: [{ center: 563, width: 52, height: 0.46 }] });
  definitions.push({ bin: 5, base: 0.09, peaks: [{ center: 568, width: 55, height: 0.47 }] });

  // Bin 6 (112.5-135): Yellow-Green
  definitions.push({ bin: 6, base: 0.10, peaks: [{ center: 550, width: 50, height: 0.40 }] });
  definitions.push({ bin: 6, base: 0.12, peaks: [{ center: 545, width: 48, height: 0.38 }] });
  definitions.push({ bin: 6, base: 0.08, peaks: [{ center: 555, width: 55, height: 0.42 }] });
  definitions.push({ bin: 6, base: 0.14, peaks: [{ center: 540, width: 45, height: 0.35 }] });
  definitions.push({ bin: 6, base: 0.11, peaks: [{ center: 548, width: 50, height: 0.39 }] });
  definitions.push({ bin: 6, base: 0.09, peaks: [{ center: 552, width: 52, height: 0.41 }] });

  // Bin 7 (135-157.5): Green
  definitions.push({ bin: 7, base: 0.08, peaks: [{ center: 530, width: 45, height: 0.35 }] });
  definitions.push({ bin: 7, base: 0.10, peaks: [{ center: 525, width: 42, height: 0.32 }] });
  definitions.push({ bin: 7, base: 0.06, peaks: [{ center: 535, width: 50, height: 0.38 }] });
  definitions.push({ bin: 7, base: 0.12, peaks: [{ center: 520, width: 40, height: 0.30 }] });
  definitions.push({ bin: 7, base: 0.09, peaks: [{ center: 528, width: 45, height: 0.34 }] });
  definitions.push({ bin: 7, base: 0.07, peaks: [{ center: 533, width: 48, height: 0.36 }] });

  // Bin 8 (157.5-180): Green-Cyan
  definitions.push({ bin: 8, base: 0.10, peaks: [{ center: 510, width: 45, height: 0.30 }] });
  definitions.push({ bin: 8, base: 0.12, peaks: [{ center: 505, width: 42, height: 0.28 }] });
  definitions.push({ bin: 8, base: 0.08, peaks: [{ center: 515, width: 50, height: 0.32 }] });
  definitions.push({ bin: 8, base: 0.14, peaks: [{ center: 500, width: 40, height: 0.25 }] });
  definitions.push({ bin: 8, base: 0.11, peaks: [{ center: 508, width: 45, height: 0.29 }] });
  definitions.push({ bin: 8, base: 0.09, peaks: [{ center: 512, width: 48, height: 0.31 }] });

  // Bin 9 (180-202.5): Cyan
  definitions.push({ bin: 9, base: 0.12, peaks: [{ center: 490, width: 45, height: 0.28 }] });
  definitions.push({ bin: 9, base: 0.14, peaks: [{ center: 485, width: 42, height: 0.25 }] });
  definitions.push({ bin: 9, base: 0.10, peaks: [{ center: 495, width: 50, height: 0.30 }] });
  definitions.push({ bin: 9, base: 0.16, peaks: [{ center: 482, width: 40, height: 0.22 }] });
  definitions.push({ bin: 9, base: 0.13, peaks: [{ center: 488, width: 45, height: 0.26 }] });
  definitions.push({ bin: 9, base: 0.11, peaks: [{ center: 492, width: 48, height: 0.28 }] });

  // Bin 10 (202.5-225): Blue-Cyan
  definitions.push({ bin: 10, base: 0.12, peaks: [{ center: 478, width: 40, height: 0.25 }] });
  definitions.push({ bin: 10, base: 0.14, peaks: [{ center: 473, width: 38, height: 0.22 }] });
  definitions.push({ bin: 10, base: 0.10, peaks: [{ center: 483, width: 45, height: 0.28 }] });
  definitions.push({ bin: 10, base: 0.16, peaks: [{ center: 470, width: 35, height: 0.20 }] });
  definitions.push({ bin: 10, base: 0.13, peaks: [{ center: 475, width: 40, height: 0.24 }] });
  definitions.push({ bin: 10, base: 0.11, peaks: [{ center: 480, width: 42, height: 0.26 }] });

  // Bin 11 (225-247.5): Blue
  definitions.push({ bin: 11, base: 0.10, peaks: [{ center: 460, width: 38, height: 0.25 }] });
  definitions.push({ bin: 11, base: 0.12, peaks: [{ center: 455, width: 35, height: 0.22 }] });
  definitions.push({ bin: 11, base: 0.08, peaks: [{ center: 465, width: 42, height: 0.28 }] });
  definitions.push({ bin: 11, base: 0.14, peaks: [{ center: 450, width: 32, height: 0.20 }] });
  definitions.push({ bin: 11, base: 0.11, peaks: [{ center: 458, width: 38, height: 0.24 }] });
  definitions.push({ bin: 11, base: 0.09, peaks: [{ center: 462, width: 40, height: 0.26 }] });

  // Bin 12 (247.5-270): Blue-Violet
  definitions.push({ bin: 12, base: 0.10, peaks: [{ center: 445, width: 35, height: 0.22 }] });
  definitions.push({ bin: 12, base: 0.12, peaks: [{ center: 440, width: 32, height: 0.20 }] });
  definitions.push({ bin: 12, base: 0.08, peaks: [{ center: 450, width: 40, height: 0.25 }] });
  definitions.push({ bin: 12, base: 0.14, peaks: [{ center: 435, width: 30, height: 0.18 }] });
  definitions.push({ bin: 12, base: 0.11, peaks: [{ center: 442, width: 35, height: 0.21 }] });
  definitions.push({ bin: 12, base: 0.09, peaks: [{ center: 448, width: 38, height: 0.23 }] });

  // Bin 13 (270-292.5): Violet
  definitions.push({ bin: 13, base: 0.10, peaks: [{ center: 430, width: 30, height: 0.18 }, { center: 660, width: 40, height: 0.06 }] });
  definitions.push({ bin: 13, base: 0.12, peaks: [{ center: 425, width: 28, height: 0.16 }, { center: 665, width: 42, height: 0.05 }] });
  definitions.push({ bin: 13, base: 0.08, peaks: [{ center: 435, width: 35, height: 0.20 }, { center: 655, width: 38, height: 0.07 }] });
  definitions.push({ bin: 13, base: 0.14, peaks: [{ center: 420, width: 25, height: 0.14 }, { center: 670, width: 45, height: 0.04 }] });
  definitions.push({ bin: 13, base: 0.11, peaks: [{ center: 428, width: 30, height: 0.17 }, { center: 662, width: 40, height: 0.06 }] });
  definitions.push({ bin: 13, base: 0.09, peaks: [{ center: 432, width: 32, height: 0.19 }, { center: 658, width: 38, height: 0.07 }] });

  // Bin 14 (292.5-315): Purple
  definitions.push({ bin: 14, base: 0.10, peaks: [{ center: 420, width: 28, height: 0.15 }, { center: 680, width: 50, height: 0.10 }] });
  definitions.push({ bin: 14, base: 0.12, peaks: [{ center: 415, width: 25, height: 0.12 }, { center: 685, width: 52, height: 0.08 }] });
  definitions.push({ bin: 14, base: 0.08, peaks: [{ center: 425, width: 32, height: 0.18 }, { center: 675, width: 48, height: 0.12 }] });
  definitions.push({ bin: 14, base: 0.14, peaks: [{ center: 410, width: 22, height: 0.10 }, { center: 690, width: 55, height: 0.07 }] });
  definitions.push({ bin: 14, base: 0.11, peaks: [{ center: 418, width: 28, height: 0.14 }, { center: 682, width: 50, height: 0.09 }] });
  definitions.push({ bin: 14, base: 0.09, peaks: [{ center: 422, width: 30, height: 0.16 }, { center: 678, width: 48, height: 0.11 }] });

  // Bin 15 (315-337.5): Pink
  definitions.push({ bin: 15, base: 0.12, peaks: [{ center: 410, width: 25, height: 0.10 }, { center: 660, width: 55, height: 0.18 }] });
  definitions.push({ bin: 15, base: 0.14, peaks: [{ center: 405, width: 22, height: 0.08 }, { center: 665, width: 58, height: 0.15 }] });
  definitions.push({ bin: 15, base: 0.10, peaks: [{ center: 415, width: 28, height: 0.12 }, { center: 655, width: 52, height: 0.20 }] });
  definitions.push({ bin: 15, base: 0.16, peaks: [{ center: 400, width: 20, height: 0.06 }, { center: 670, width: 60, height: 0.12 }] });
  definitions.push({ bin: 15, base: 0.13, peaks: [{ center: 408, width: 25, height: 0.09 }, { center: 662, width: 55, height: 0.17 }] });
  definitions.push({ bin: 15, base: 0.11, peaks: [{ center: 412, width: 26, height: 0.11 }, { center: 658, width: 53, height: 0.19 }] });

  // Bin 16 (337.5-360): Pink-Red
  definitions.push({ bin: 16, base: 0.10, peaks: [{ center: 660, width: 60, height: 0.30 }] });
  definitions.push({ bin: 16, base: 0.12, peaks: [{ center: 655, width: 55, height: 0.28 }] });
  definitions.push({ bin: 16, base: 0.08, peaks: [{ center: 665, width: 65, height: 0.32 }] });
  definitions.push({ bin: 16, base: 0.14, peaks: [{ center: 650, width: 50, height: 0.25 }] });
  definitions.push({ bin: 16, base: 0.11, peaks: [{ center: 658, width: 58, height: 0.29 }] });

  // Total: 99 samples (6 per bin * 16 bins = 96 + 3 fewer in last bin = ~99)
  // Last bin has 5 -> total 101, but we'll use first 99
  return definitions.slice(0, 99);
}

// Pre-generate CES data
const CES_DEFINITIONS = generateCESDefinitions();
const CES_REFLECTANCES = CES_DEFINITIONS.map((def) => generateCESReflectance(def));

// ============================================================
// Core Calculation Functions
// ============================================================

function spectrumReflToXYZ(illuminant: SpectrumPoint[], reflectance: number[]): XYZColor {
  let X = 0, Y = 0, Z = 0, Yn = 0;
  const len = Math.min(illuminant.length, reflectance.length);

  for (let i = 0; i < len; i++) {
    const wl = 380 + i * 5;
    const S = illuminant[i].intensity;
    const R = reflectance[i];
    const xBar = interpolateObserver(wl, 'x');
    const yBar = interpolateObserver(wl, 'y');
    const zBar = interpolateObserver(wl, 'z');

    X += S * R * xBar * 5;
    Y += S * R * yBar * 5;
    Z += S * R * zBar * 5;
    Yn += S * yBar * 5;
  }

  if (Yn > 0) {
    const k = 100 / Yn;
    X *= k;
    Y *= k;
    Z *= k;
  }

  return { X, Y, Z };
}

function getIlluminantXYZ(illuminant: SpectrumPoint[]): XYZColor {
  let X = 0, Y = 0, Z = 0;

  for (let i = 0; i < illuminant.length; i++) {
    const wl = 380 + i * 5;
    const S = illuminant[i].intensity;
    const xBar = interpolateObserver(wl, 'x');
    const yBar = interpolateObserver(wl, 'y');
    const zBar = interpolateObserver(wl, 'z');

    X += S * xBar * 5;
    Y += S * yBar * 5;
    Z += S * zBar * 5;
  }

  if (Y > 0) {
    const k = 100 / Y;
    X *= k;
    Y = 100;
    Z *= k;
  }

  return { X, Y, Z };
}

function resampleTo5nm(spectrum: SpectrumPoint[]): SpectrumPoint[] {
  const sorted = [...spectrum].sort((a, b) => a.wavelength - b.wavelength);
  const result: SpectrumPoint[] = [];

  for (let wl = 380; wl <= 780; wl += 5) {
    if (wl <= sorted[0].wavelength) {
      result.push({ wavelength: wl, intensity: sorted[0].intensity });
      continue;
    }
    if (wl >= sorted[sorted.length - 1].wavelength) {
      result.push({ wavelength: wl, intensity: sorted[sorted.length - 1].intensity });
      continue;
    }

    let j = 0;
    while (j < sorted.length - 1 && sorted[j + 1].wavelength < wl) j++;

    const t = (wl - sorted[j].wavelength) / (sorted[j + 1].wavelength - sorted[j].wavelength);
    result.push({
      wavelength: wl,
      intensity: sorted[j].intensity + t * (sorted[j + 1].intensity - sorted[j].intensity),
    });
  }

  return result;
}

/**
 * Calculate IES TM-30-20 Rf (Fidelity Index) and Rg (Gamut Index).
 *
 * Rf interpretation:
 * - 100: Perfect color fidelity
 * - 80+: Excellent
 * - 70-80: Good
 * - 60-70: Fair
 * - <60: Poor
 *
 * Rg interpretation:
 * - 100: Same gamut area as reference
 * - >100: Increased saturation (larger gamut)
 * - <100: Decreased saturation (smaller gamut)
 */
export function calculateTM30(testSpectrum: SpectrumPoint[]): TM30Result {
  const testSPD = resampleTo5nm(testSpectrum);

  // Calculate CCT
  const testIllumXYZ = getIlluminantXYZ(testSPD);
  const sumXYZ = testIllumXYZ.X + testIllumXYZ.Y + testIllumXYZ.Z;
  const tx = sumXYZ > 0 ? testIllumXYZ.X / sumXYZ : 0.3127;
  const ty = sumXYZ > 0 ? testIllumXYZ.Y / sumXYZ : 0.3290;
  const cct = calculateCCT(tx, ty);

  // Reference illuminant
  const refSPD = getReferenceIlluminant(cct);
  const testWhiteXYZ = getIlluminantXYZ(testSPD);
  const refWhiteXYZ = getIlluminantXYZ(refSPD);

  // Calculate Lab coordinates for all CES under test and reference
  const testLabs: LabColor[] = [];
  const refLabs: LabColor[] = [];

  for (let i = 0; i < CES_REFLECTANCES.length; i++) {
    const refl = CES_REFLECTANCES[i];

    const testXYZ = spectrumReflToXYZ(testSPD, refl);
    const refXYZ = spectrumReflToXYZ(refSPD, refl);

    testLabs.push(xyzToLab(testXYZ, testWhiteXYZ));
    refLabs.push(xyzToLab(refXYZ, refWhiteXYZ));
  }

  // Calculate Rf (Fidelity Index)
  // Rf = 10 * ln(exp((100 - cf * mean_deltaE) / 10) + 1)
  // cf = 6.73 (scaling factor from TM-30)
  let totalDeltaE = 0;
  for (let i = 0; i < CES_REFLECTANCES.length; i++) {
    totalDeltaE += deltaE2000(testLabs[i], refLabs[i]);
  }
  const meanDeltaE = totalDeltaE / CES_REFLECTANCES.length;
  const cf = 6.73;
  const Rf = 10 * Math.log(Math.exp((100 - cf * meanDeltaE) / 10) + 1);

  // Calculate per-bin averages
  const binTestA: number[] = new Array(16).fill(0);
  const binTestB: number[] = new Array(16).fill(0);
  const binRefA: number[] = new Array(16).fill(0);
  const binRefB: number[] = new Array(16).fill(0);
  const binCount: number[] = new Array(16).fill(0);
  const binDeltaE: number[] = new Array(16).fill(0);

  for (let i = 0; i < CES_DEFINITIONS.length; i++) {
    const binIdx = CES_DEFINITIONS[i].bin - 1; // 0-indexed
    binTestA[binIdx] += testLabs[i].a;
    binTestB[binIdx] += testLabs[i].b;
    binRefA[binIdx] += refLabs[i].a;
    binRefB[binIdx] += refLabs[i].b;
    binCount[binIdx]++;
    binDeltaE[binIdx] += deltaE2000(testLabs[i], refLabs[i]);
  }

  // Average per bin
  for (let b = 0; b < 16; b++) {
    if (binCount[b] > 0) {
      binTestA[b] /= binCount[b];
      binTestB[b] /= binCount[b];
      binRefA[b] /= binCount[b];
      binRefB[b] /= binCount[b];
      binDeltaE[b] /= binCount[b];
    }
  }

  // Calculate Rg (Gamut Index)
  // Rg = 100 * (area_test / area_ref)
  // Area calculated as polygon area in a*b* plane
  const testArea = polygonArea(binTestA, binTestB);
  const refArea = polygonArea(binRefA, binRefB);
  const Rg = refArea > 0 ? 100 * (testArea / refArea) : 100;

  // Per-bin Rf
  const binRf: number[] = binDeltaE.map((dE) =>
    Math.round(10 * Math.log(Math.exp((100 - cf * dE) / 10) + 1) * 10) / 10,
  );

  // Per-bin hue shift and chroma change
  const binHueShift: number[] = [];
  const binChromaChange: number[] = [];

  for (let b = 0; b < 16; b++) {
    const testHue = Math.atan2(binTestB[b], binTestA[b]) * 180 / Math.PI;
    const refHue = Math.atan2(binRefB[b], binRefA[b]) * 180 / Math.PI;
    let hueShift = testHue - refHue;
    if (hueShift > 180) hueShift -= 360;
    if (hueShift < -180) hueShift += 360;
    binHueShift.push(Math.round(hueShift * 10) / 10);

    const testChroma = Math.sqrt(binTestA[b] ** 2 + binTestB[b] ** 2);
    const refChroma = Math.sqrt(binRefA[b] ** 2 + binRefB[b] ** 2);
    binChromaChange.push(refChroma > 0 ? Math.round((testChroma / refChroma) * 100) / 100 : 1);
  }

  // Color vectors for visualization
  const colorVectors = [];
  for (let b = 0; b < 16; b++) {
    colorVectors.push({
      bin: b + 1,
      hueAngle: b * 22.5 + 11.25, // center of each bin
      refA: Math.round(binRefA[b] * 100) / 100,
      refB: Math.round(binRefB[b] * 100) / 100,
      testA: Math.round(binTestA[b] * 100) / 100,
      testB: Math.round(binTestB[b] * 100) / 100,
    });
  }

  return {
    Rf: Math.round(Math.max(0, Math.min(100, Rf)) * 10) / 10,
    Rg: Math.round(Math.max(0, Rg) * 10) / 10,
    cct: Math.round(cct),
    binRf,
    binHueShift,
    binChromaChange,
    colorVectors,
  };
}

/**
 * Calculate area of a polygon defined by (a, b) coordinates using the shoelace formula.
 */
function polygonArea(a: number[], b: number[]): number {
  const n = a.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += a[i] * b[j];
    area -= a[j] * b[i];
  }
  return Math.abs(area) / 2;
}
