/**
 * CRI Reference Illuminants and Test Color Samples (TCS)
 *
 * Contains:
 * - CIE Standard Illuminant A spectral power distribution
 * - CIE D-series illuminant calculation (D50, D55, D65, D75)
 * - Planckian (blackbody) radiator SPD calculation
 * - 14 Test Color Samples (TCS) spectral reflectance data per CIE 13.3-1995
 *
 * Data source: CIE 13.3-1995 "Method of Measuring and Specifying
 * Colour Rendering Properties of Light Sources"
 *
 * Wavelength range: 380-780nm, 5nm intervals (matching CIE1931_OBSERVER)
 */

import type { SpectrumPoint } from '@/types';
import cieCriSamplesCsv from './data/CIE_srf_cri.csv?raw';

// ============================================================
// Planckian (Blackbody) Radiator SPD
// ============================================================

/** Planck's radiation law constants */
const C1 = 3.7417749e-16; // 2 * pi * h * c^2 (W*m^2)
const C2 = 1.4388e-2; // h * c / k (m*K)

/**
 * Calculate relative SPD of a Planckian (blackbody) radiator at given temperature.
 * Returns normalized spectrum (peak = 1.0) for 380-780nm range.
 */
export function planckianSPD(temperature: number): SpectrumPoint[] {
  const points: SpectrumPoint[] = [];
  let maxIntensity = 0;

  for (let wl = 380; wl <= 780; wl += 5) {
    const lambda = wl * 1e-9; // convert nm to meters
    // Planck's law: M(lambda, T) = C1 / (lambda^5 * (exp(C2 / (lambda * T)) - 1))
    const intensity = C1 / (Math.pow(lambda, 5) * (Math.exp(C2 / (lambda * temperature)) - 1));
    points.push({ wavelength: wl, intensity });
    if (intensity > maxIntensity) maxIntensity = intensity;
  }

  // Normalize to peak = 1.0
  if (maxIntensity > 0) {
    for (const p of points) {
      p.intensity /= maxIntensity;
    }
  }

  return points;
}

// ============================================================
// CIE Standard Illuminant A (2856K incandescent)
// ============================================================

/**
 * CIE Standard Illuminant A: Relative SPD
 * Represents typical domestic tungsten-filament lighting (2856K).
 * Values from CIE 15:2018, normalized so S(560nm) = 100.
 *
 * Formula: S_A(lambda) = 100 * (560/lambda)^5 * ((exp(C2/(560*T)) - 1) / (exp(C2/(lambda*T)) - 1))
 * where T = 2856K
 */
export function illuminantA_SPD(): SpectrumPoint[] {
  const T = 2856;
  const points: SpectrumPoint[] = [];

  for (let wl = 380; wl <= 780; wl += 5) {
    const ratio = 560 / wl;
    const exp560 = Math.exp(C2 / (560e-9 * T)) - 1;
    const expWl = Math.exp(C2 / (wl * 1e-9 * T)) - 1;
    const s = 100 * Math.pow(ratio, 5) * (exp560 / expWl);
    points.push({ wavelength: wl, intensity: s });
  }

  return points;
}

// ============================================================
// CIE D-series Illuminant Calculation
// ============================================================

/**
 * CIE Daylight (D-series) illuminant eigenvectors S0, S1, S2.
 * Used to reconstruct D-illuminant SPD from CCT.
 * Source: CIE 15:2018, Table 5 (380-780nm, 5nm steps)
 */
const D_EIGENVECTORS: { S0: number; S1: number; S2: number }[] = [
  // 380nm - 780nm, 5nm intervals (81 values)
  { S0: 63.40, S1: 38.50, S2: 3.00 },   // 380
  { S0: 64.60, S1: 36.75, S2: 2.10 },   // 385
  { S0: 65.80, S1: 35.00, S2: 1.20 },   // 390
  { S0: 80.30, S1: 39.20, S2: 0.05 },   // 395
  { S0: 94.80, S1: 43.40, S2: -1.10 },  // 400
  { S0: 99.80, S1: 44.85, S2: -0.80 },  // 405
  { S0: 104.80, S1: 46.30, S2: -0.50 }, // 410
  { S0: 105.35, S1: 45.10, S2: -0.60 }, // 415
  { S0: 105.90, S1: 43.90, S2: -0.70 }, // 420
  { S0: 101.35, S1: 40.50, S2: -0.95 }, // 425
  { S0: 96.80, S1: 37.10, S2: -1.20 },  // 430
  { S0: 105.35, S1: 36.90, S2: -1.90 }, // 435
  { S0: 113.90, S1: 36.70, S2: -2.60 }, // 440
  { S0: 119.75, S1: 36.30, S2: -2.75 }, // 445
  { S0: 125.60, S1: 35.90, S2: -2.90 }, // 450
  { S0: 125.55, S1: 34.25, S2: -2.85 }, // 455
  { S0: 125.50, S1: 32.60, S2: -2.80 }, // 460
  { S0: 123.40, S1: 30.25, S2: -2.70 }, // 465
  { S0: 121.30, S1: 27.90, S2: -2.60 }, // 470
  { S0: 121.30, S1: 26.10, S2: -2.60 }, // 475
  { S0: 121.30, S1: 24.30, S2: -2.60 }, // 480
  { S0: 117.40, S1: 22.20, S2: -2.20 }, // 485
  { S0: 113.50, S1: 20.10, S2: -1.80 }, // 490
  { S0: 113.30, S1: 18.15, S2: -1.65 }, // 495
  { S0: 113.10, S1: 16.20, S2: -1.50 }, // 500
  { S0: 111.95, S1: 14.70, S2: -1.40 }, // 505
  { S0: 110.80, S1: 13.20, S2: -1.30 }, // 510
  { S0: 108.65, S1: 10.90, S2: -1.25 }, // 515
  { S0: 106.50, S1: 8.60, S2: -1.20 },  // 520
  { S0: 107.65, S1: 7.35, S2: -1.10 },  // 525
  { S0: 108.80, S1: 6.10, S2: -1.00 },  // 530
  { S0: 107.05, S1: 5.15, S2: -0.75 },  // 535
  { S0: 105.30, S1: 4.20, S2: -0.50 },  // 540
  { S0: 104.85, S1: 3.05, S2: -0.40 },  // 545
  { S0: 104.40, S1: 1.90, S2: -0.30 },  // 550
  { S0: 102.20, S1: 0.95, S2: -0.15 },  // 555
  { S0: 100.00, S1: 0.00, S2: 0.00 },   // 560
  { S0: 98.00, S1: -0.80, S2: 0.10 },   // 565
  { S0: 96.00, S1: -1.60, S2: 0.20 },   // 570
  { S0: 95.55, S1: -2.55, S2: 0.35 },   // 575
  { S0: 95.10, S1: -3.50, S2: 0.50 },   // 580
  { S0: 92.10, S1: -3.50, S2: 1.30 },   // 585
  { S0: 89.10, S1: -3.50, S2: 2.10 },   // 590
  { S0: 89.80, S1: -4.65, S2: 2.65 },   // 595
  { S0: 90.50, S1: -5.80, S2: 3.20 },   // 600
  { S0: 90.40, S1: -6.50, S2: 3.65 },   // 605
  { S0: 90.30, S1: -7.20, S2: 4.10 },   // 610
  { S0: 89.35, S1: -7.90, S2: 4.40 },   // 615
  { S0: 88.40, S1: -8.60, S2: 4.70 },   // 620
  { S0: 86.20, S1: -9.05, S2: 4.90 },   // 625
  { S0: 84.00, S1: -9.50, S2: 5.10 },   // 630
  { S0: 84.55, S1: -10.20, S2: 5.90 },  // 635
  { S0: 85.10, S1: -10.90, S2: 6.70 },  // 640
  { S0: 83.50, S1: -10.80, S2: 7.00 },  // 645
  { S0: 81.90, S1: -10.70, S2: 7.30 },  // 650
  { S0: 82.25, S1: -11.35, S2: 7.95 },  // 655
  { S0: 82.60, S1: -12.00, S2: 8.60 },  // 660
  { S0: 83.75, S1: -13.00, S2: 9.20 },  // 665
  { S0: 84.90, S1: -14.00, S2: 9.80 },  // 670
  { S0: 83.10, S1: -13.80, S2: 10.00 }, // 675
  { S0: 81.30, S1: -13.60, S2: 10.20 }, // 680
  { S0: 76.60, S1: -12.80, S2: 9.25 },  // 685
  { S0: 71.90, S1: -12.00, S2: 8.30 },  // 690
  { S0: 73.10, S1: -12.65, S2: 8.95 },  // 695
  { S0: 74.30, S1: -13.30, S2: 9.60 },  // 700
  { S0: 75.35, S1: -13.10, S2: 9.05 },  // 705
  { S0: 76.40, S1: -12.90, S2: 8.50 },  // 710
  { S0: 69.85, S1: -11.75, S2: 7.75 },  // 715
  { S0: 63.30, S1: -10.60, S2: 7.00 },  // 720
  { S0: 67.50, S1: -11.10, S2: 7.30 },  // 725
  { S0: 71.70, S1: -11.60, S2: 7.60 },  // 730
  { S0: 74.35, S1: -11.90, S2: 7.80 },  // 735
  { S0: 77.00, S1: -12.20, S2: 8.00 },  // 740
  { S0: 71.10, S1: -11.20, S2: 7.35 },  // 745
  { S0: 65.20, S1: -10.20, S2: 6.70 },  // 750
  { S0: 56.45, S1: -9.00, S2: 5.95 },   // 755
  { S0: 47.70, S1: -7.80, S2: 5.20 },   // 760
  { S0: 58.15, S1: -9.50, S2: 6.30 },   // 765
  { S0: 68.60, S1: -11.20, S2: 7.40 },  // 770
  { S0: 66.80, S1: -10.80, S2: 7.10 },  // 775
  { S0: 65.00, S1: -10.40, S2: 6.80 },  // 780
];

/**
 * Calculate CIE D-series illuminant SPD from correlated color temperature.
 *
 * Valid CCT range: 4000K - 25000K
 *
 * Steps:
 * 1. Calculate xD from CCT
 * 2. Calculate yD from xD
 * 3. Calculate M1, M2 coefficients
 * 4. Reconstruct SPD: S(lambda) = S0(lambda) + M1*S1(lambda) + M2*S2(lambda)
 */
export function dIlluminantSPD(cct: number): SpectrumPoint[] {
  // Step 1: Calculate xD
  let xD: number;
  if (cct >= 4000 && cct <= 7000) {
    xD = -4.6070e9 / (cct * cct * cct) + 2.9678e6 / (cct * cct) + 0.09911e3 / cct + 0.244063;
  } else if (cct > 7000 && cct <= 25000) {
    xD = -2.0064e9 / (cct * cct * cct) + 1.9018e6 / (cct * cct) + 0.24748e3 / cct + 0.237040;
  } else {
    // Outside valid range: use closest valid endpoint
    xD = cct < 4000 ? 0.382 : 0.252;
  }

  // Step 2: Calculate yD
  const yD = -3.000 * xD * xD + 2.870 * xD - 0.275;

  // Step 3: Calculate M1, M2
  const M = 0.0241 + 0.2562 * xD - 0.7341 * yD;
  const M1 = (-1.3515 - 1.7703 * xD + 5.9114 * yD) / M;
  const M2 = (0.0300 - 31.4424 * xD + 30.0717 * yD) / M;

  // Step 4: Reconstruct SPD
  const points: SpectrumPoint[] = [];
  for (let i = 0; i < D_EIGENVECTORS.length; i++) {
    const wl = 380 + i * 5;
    const { S0, S1, S2 } = D_EIGENVECTORS[i];
    const s = S0 + M1 * S1 + M2 * S2;
    points.push({ wavelength: wl, intensity: Math.max(0, s) });
  }

  return points;
}

/**
 * Get reference illuminant SPD for CRI calculation based on CCT.
 *
 * Per CIE 13.3:
 * - CCT < 5000K: Use Planckian (blackbody) radiator at the test source CCT
 * - CCT >= 5000K: Use CIE D-series illuminant at the test source CCT
 *
 * The returned SPD is NOT normalized to peak=1; it retains the relative shape
 * of the reference illuminant for accurate colorimetric calculations.
 */
export function getReferenceIlluminant(cct: number): SpectrumPoint[] {
  if (cct < 5000) {
    return planckianSPD(cct);
  } else {
    return dIlluminantSPD(cct);
  }
}

// ============================================================
// CIE 13.3 Test Color Samples (TCS) Reflectance Data
// ============================================================

/**
 * Exact CIE 13.3-1995 TCS spectral radiance factors.
 *
 * Source: CIE open dataset 10.25039/CIE.DS.wuiuu9cz. Upstream SHA-256 is
 * f461decedb5c18800c61a6923240c71f6cf91fd23ac94865133cbfdb7e05c0ad;
 * the LF-normalized repository copy is
 * 83c4bbb7bf774b90fb671820fa22342a174e0abe5e26a281872b7c792d5179ec.
 * The dataset is licensed CC BY-SA 4.0. The source covers 360-830 nm; this
 * calculator uses the 380-780 nm rows at 5 nm intervals.
 */
function parseTcsReflectance(csv: string): number[][] {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map(Number))
    .filter((row) => row[0] >= 380 && row[0] <= 780);

  if (rows.length !== 81 || rows.some((row) => row.length !== 15 || row.some(Number.isNaN))) {
    throw new Error('Invalid CIE CRI test-sample dataset');
  }

  return Array.from({ length: 14 }, (_, sampleIndex) =>
    rows.map((row) => row[sampleIndex + 1]),
  );
}

export const TCS_REFLECTANCE: number[][] = parseTcsReflectance(cieCriSamplesCsv);

/** TCS color names for UI display */
export const TCS_NAMES: string[] = [
  'TCS01 Light Greyish Red',
  'TCS02 Dark Greyish Yellow',
  'TCS03 Strong Yellow Green',
  'TCS04 Moderate Yellowish Green',
  'TCS05 Light Bluish Green',
  'TCS06 Light Blue',
  'TCS07 Light Violet',
  'TCS08 Light Reddish Purple',
  'TCS09 Strong Red',
  'TCS10 Strong Yellow',
  'TCS11 Strong Green',
  'TCS12 Strong Blue',
  'TCS13 Light Yellowish Pink',
  'TCS14 Moderate Olive Green',
];

/** Short labels for compact display */
export const TCS_SHORT_LABELS: string[] = [
  'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8',
  'R9', 'R10', 'R11', 'R12', 'R13', 'R14',
];
