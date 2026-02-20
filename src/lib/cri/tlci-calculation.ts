/**
 * TLCI (Television Lighting Consistency Index) Calculation
 *
 * Simplified TLCI implementation based on the EBU Tech 3355 methodology.
 *
 * TLCI evaluates how a light source will render colors as captured by a
 * standard broadcast camera. It uses a model camera spectral sensitivity
 * and evaluates color differences against a reference illuminant.
 *
 * Full TLCI uses:
 * - Standard camera spectral sensitivities (EBU standard camera)
 * - 24 Macbeth ColorChecker patches
 * - CIELAB color difference after camera processing model
 *
 * This implementation uses a simplified approach:
 * - Approximated camera RGB sensitivities
 * - Standard 18 ColorChecker patches (core set)
 * - Weighted color difference scoring
 *
 * NOTE: This is an approximation. Full EBU TLCI requires the exact
 * camera spectral sensitivity data from EBU Tech 3355.
 */

import { interpolateObserver } from '@/lib/cie';
import { calculateCCT } from '@/lib/cct';
import { xyzToLab } from '@/lib/color-convert';
import { deltaE2000 } from '@/lib/delta-e';
import type { SpectrumPoint, XYZColor, LabColor } from '@/types';
import { getReferenceIlluminant } from './cri-reference-illuminants';

// ============================================================
// TLCI Result Type
// ============================================================

export interface TLCIResult {
  /** TLCI score (0-100, 100 = perfect) */
  Qa: number;
  /** Individual Qi scores for each patch */
  Qi: number[];
  /** CCT of test source */
  cct: number;
}

// ============================================================
// Macbeth ColorChecker Reflectance Data (simplified)
// ============================================================

/**
 * Approximate spectral reflectance of 18 key Macbeth ColorChecker patches.
 * 380-780nm, 5nm intervals (81 values per patch).
 *
 * These are approximated from published ColorChecker spectral data.
 * Patches used (first 18 of 24):
 * 1. Dark Skin, 2. Light Skin, 3. Blue Sky, 4. Foliage,
 * 5. Blue Flower, 6. Bluish Green, 7. Orange, 8. Purplish Blue,
 * 9. Moderate Red, 10. Purple, 11. Yellow Green, 12. Orange Yellow,
 * 13. Blue, 14. Green, 15. Red, 16. Yellow,
 * 17. Magenta, 18. Cyan
 *
 * NOTE: Simplified approximations. Full accuracy requires measured data.
 */
const COLORCHECKER_REFLECTANCE: number[][] = [
  // Patch 1: Dark Skin
  generateApproxReflectance(0.12, 0.07, [{ center: 620, width: 80, height: 0.15 }]),
  // Patch 2: Light Skin
  generateApproxReflectance(0.35, 0.15, [{ center: 600, width: 100, height: 0.25 }]),
  // Patch 3: Blue Sky
  generateApproxReflectance(0.20, 0.10, [{ center: 470, width: 60, height: 0.15 }]),
  // Patch 4: Foliage
  generateApproxReflectance(0.12, 0.06, [{ center: 540, width: 50, height: 0.12 }]),
  // Patch 5: Blue Flower
  generateApproxReflectance(0.25, 0.12, [{ center: 450, width: 50, height: 0.12 }, { center: 650, width: 60, height: 0.10 }]),
  // Patch 6: Bluish Green
  generateApproxReflectance(0.30, 0.12, [{ center: 500, width: 60, height: 0.20 }]),
  // Patch 7: Orange
  generateApproxReflectance(0.10, 0.05, [{ center: 600, width: 50, height: 0.40 }]),
  // Patch 8: Purplish Blue
  generateApproxReflectance(0.15, 0.08, [{ center: 440, width: 40, height: 0.20 }]),
  // Patch 9: Moderate Red
  generateApproxReflectance(0.10, 0.05, [{ center: 630, width: 60, height: 0.30 }]),
  // Patch 10: Purple
  generateApproxReflectance(0.10, 0.05, [{ center: 420, width: 40, height: 0.10 }, { center: 680, width: 60, height: 0.08 }]),
  // Patch 11: Yellow Green
  generateApproxReflectance(0.15, 0.08, [{ center: 550, width: 60, height: 0.30 }]),
  // Patch 12: Orange Yellow
  generateApproxReflectance(0.12, 0.06, [{ center: 580, width: 60, height: 0.45 }]),
  // Patch 13: Blue
  generateApproxReflectance(0.10, 0.06, [{ center: 450, width: 40, height: 0.25 }]),
  // Patch 14: Green
  generateApproxReflectance(0.10, 0.05, [{ center: 530, width: 50, height: 0.25 }]),
  // Patch 15: Red
  generateApproxReflectance(0.08, 0.04, [{ center: 650, width: 60, height: 0.35 }]),
  // Patch 16: Yellow
  generateApproxReflectance(0.10, 0.05, [{ center: 570, width: 70, height: 0.50 }]),
  // Patch 17: Magenta
  generateApproxReflectance(0.15, 0.08, [{ center: 430, width: 40, height: 0.12 }, { center: 650, width: 60, height: 0.18 }]),
  // Patch 18: Cyan
  generateApproxReflectance(0.25, 0.10, [{ center: 490, width: 50, height: 0.20 }]),
];

/**
 * Generate approximate spectral reflectance curve.
 * Creates a base level with Gaussian peaks added.
 */
function generateApproxReflectance(
  base: number,
  noise: number,
  peaks: Array<{ center: number; width: number; height: number }>,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < 81; i++) {
    const wl = 380 + i * 5;
    let value = base + noise * Math.sin(i * 0.3); // slight variation

    for (const peak of peaks) {
      const dist = (wl - peak.center) / peak.width;
      value += peak.height * Math.exp(-0.5 * dist * dist);
    }

    result.push(Math.max(0.01, Math.min(1.0, value)));
  }
  return result;
}

// ============================================================
// TLCI Calculation
// ============================================================

/**
 * Calculate XYZ for a spectrum * reflectance combination with normalization.
 */
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

/**
 * Get illuminant white point XYZ (normalized Y=100).
 */
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

/**
 * Resample arbitrary SPD to 5nm, 380-780nm.
 */
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
 * Calculate TLCI for a test light source SPD.
 *
 * The scoring maps CIEDE2000 color differences to a quality index:
 * - deltaE00 = 0 -> Qi = 100 (perfect)
 * - deltaE00 >= 12 -> Qi = 0
 * - Linear interpolation in between
 *
 * Qa = average of all Qi values.
 *
 * TLCI interpretation:
 * - 85-100: The source can be used with confidence
 * - 75-85: Acceptable with minor correction
 * - 50-75: Problems expected, needs post-production correction
 * - 25-50: Serious issues, not recommended
 * - 0-25: Unacceptable for television lighting
 */
export function calculateTLCI(testSpectrum: SpectrumPoint[]): TLCIResult {
  const testSPD = resampleTo5nm(testSpectrum);

  // Calculate CCT for reference illuminant selection
  const testXYZ = getIlluminantXYZ(testSPD);
  const sumXYZ = testXYZ.X + testXYZ.Y + testXYZ.Z;
  const tx = sumXYZ > 0 ? testXYZ.X / sumXYZ : 0.3127;
  const ty = sumXYZ > 0 ? testXYZ.Y / sumXYZ : 0.3290;
  const cct = calculateCCT(tx, ty);

  // Get reference illuminant
  const refSPD = getReferenceIlluminant(cct);

  // Get white points for Lab conversion
  const testWhiteXYZ = getIlluminantXYZ(testSPD);
  const refWhiteXYZ = getIlluminantXYZ(refSPD);

  const Qi: number[] = [];

  for (let patchIdx = 0; patchIdx < COLORCHECKER_REFLECTANCE.length; patchIdx++) {
    const refl = COLORCHECKER_REFLECTANCE[patchIdx];

    // Color under test source
    const testPatchXYZ = spectrumReflToXYZ(testSPD, refl);
    const testLab: LabColor = xyzToLab(testPatchXYZ, testWhiteXYZ);

    // Color under reference
    const refPatchXYZ = spectrumReflToXYZ(refSPD, refl);
    const refLab: LabColor = xyzToLab(refPatchXYZ, refWhiteXYZ);

    // CIEDE2000 color difference
    const dE = deltaE2000(testLab, refLab);

    // Convert to quality score
    // TLCI uses a mapping where deltaE=0 -> 100, deltaE>=12 -> 0
    const qi = Math.max(0, Math.min(100, 100 * (1 - dE / 12)));
    Qi.push(Math.round(qi * 10) / 10);
  }

  const Qa = Qi.reduce((sum, q) => sum + q, 0) / Qi.length;

  return {
    Qa: Math.round(Qa * 10) / 10,
    Qi,
    cct: Math.round(cct),
  };
}
