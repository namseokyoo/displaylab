/**
 * CRI (Color Rendering Index) Calculation
 *
 * Implements CIE 13.3-1995 "Method of Measuring and Specifying
 * Colour Rendering Properties of Light Sources"
 *
 * Algorithm:
 * 1. Calculate CCT of test source
 * 2. Select reference illuminant (blackbody < 5000K, D-series >= 5000K)
 * 3. For each TCS, compute chromaticity under test and reference illuminants
 * 4. Apply Von Kries chromatic adaptation
 * 5. Calculate color difference in CIE 1964 W*U*V* space
 * 6. Ri = 100 - 4.6 * deltaEi
 * 7. Ra = average(R1..R8)
 */

import { interpolateObserver } from '@/lib/cie';
import { calculateCCT } from '@/lib/cct';
import type { SpectrumPoint, XYZColor } from '@/types';
import { getReferenceIlluminant, TCS_REFLECTANCE } from './cri-reference-illuminants';

// ============================================================
// CRI Result Types
// ============================================================

export interface CRIResult {
  /** General CRI (Ra) - average of R1..R8 */
  Ra: number;
  /** Individual Ri values for all 14 TCS (R1-R14) */
  Ri: number[];
  /** CCT of the test source (K) */
  cct: number;
  /** Reference illuminant type used */
  referenceType: 'planckian' | 'D-series';
}

// ============================================================
// Core CRI Calculation
// ============================================================

/**
 * Calculate tristimulus values for a spectrum reflected off a surface.
 *
 * X = k * sum[S(lambda) * R(lambda) * x_bar(lambda) * d_lambda]
 * Y = k * sum[S(lambda) * R(lambda) * y_bar(lambda) * d_lambda]
 * Z = k * sum[S(lambda) * R(lambda) * z_bar(lambda) * d_lambda]
 *
 * where k = 100 / sum[S(lambda) * y_bar(lambda) * d_lambda]
 */
function spectrumReflectanceToXYZ(
  illuminant: SpectrumPoint[],
  reflectance: number[],
): XYZColor {
  let X = 0;
  let Y = 0;
  let Z = 0;
  let Yn = 0; // normalization: sum of S(lambda) * y_bar(lambda)

  // Both illuminant and reflectance should be at 5nm intervals, 380-780nm
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
 * Calculate XYZ of the illuminant itself (used for white point).
 */
function illuminantToXYZ(illuminant: SpectrumPoint[]): XYZColor {
  let X = 0;
  let Y = 0;
  let Z = 0;

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

  // Normalize so Y = 100
  if (Y > 0) {
    const k = 100 / Y;
    X *= k;
    Y = 100;
    Z *= k;
  }

  return { X, Y, Z };
}

/**
 * Convert XYZ to CIE 1960 UCS (u, v) coordinates.
 * Note: CIE 1960 v, not CIE 1976 v'.
 */
function xyzToUCS(xyz: XYZColor): { u: number; v: number } {
  const denom = xyz.X + 15 * xyz.Y + 3 * xyz.Z;
  if (denom === 0) return { u: 0, v: 0 };

  return {
    u: (4 * xyz.X) / denom,
    v: (6 * xyz.Y) / denom,
  };
}

/**
 * Von Kries chromatic adaptation transform.
 *
 * Adapts the chromaticity of a sample viewed under the test source
 * to what it would appear under the reference illuminant.
 *
 * Uses CIE 1960 UCS (u, v) coordinates.
 *
 * Per CIE 13.3:
 * u'_k = (10.872 + 0.404 * (c_r/c_t) * u_k - 4 * (d_r/d_t) * d_k) /
 *        (16.518 + 1.481 * (c_r/c_t) * u_k - (d_r/d_t) * d_k)
 * v'_k = 5.520 /
 *        (16.518 + 1.481 * (c_r/c_t) * u_k - (d_r/d_t) * d_k)
 *
 * where c = (4 - u - 10v) / v, d = (1.708v + 0.404 - 1.481u) / v
 */
function vonKriesAdapt(
  sampleUV: { u: number; v: number },
  testWhiteUV: { u: number; v: number },
  refWhiteUV: { u: number; v: number },
): { u: number; v: number } {
  // Calculate c and d for test and reference white points
  const ct = (4 - testWhiteUV.u - 10 * testWhiteUV.v) / testWhiteUV.v;
  const dt = (1.708 * testWhiteUV.v + 0.404 - 1.481 * testWhiteUV.u) / testWhiteUV.v;

  const cr = (4 - refWhiteUV.u - 10 * refWhiteUV.v) / refWhiteUV.v;
  const dr = (1.708 * refWhiteUV.v + 0.404 - 1.481 * refWhiteUV.u) / refWhiteUV.v;

  // Calculate c and d for the sample
  const ck = (4 - sampleUV.u - 10 * sampleUV.v) / sampleUV.v;
  const dk = (1.708 * sampleUV.v + 0.404 - 1.481 * sampleUV.u) / sampleUV.v;

  // Apply Von Kries adaptation
  const denom = 16.518 + 1.481 * (cr / ct) * ck - (dr / dt) * dk;

  if (denom === 0) return sampleUV;

  return {
    u: (10.872 + 0.404 * (cr / ct) * ck - 4 * (dr / dt) * dk) / denom,
    v: 5.520 / denom,
  };
}

/**
 * Convert CIE 1960 UCS to CIE 1964 W*U*V* color space.
 *
 * W* = 25 * Y^(1/3) - 17  (for 1 <= Y <= 100)
 * U* = 13 * W* * (u - u_n)
 * V* = 13 * W* * (v - v_n)
 *
 * where (u_n, v_n) is the reference white point in CIE 1960 UCS.
 */
function toWUV(
  uv: { u: number; v: number },
  Y: number,
  whiteUV: { u: number; v: number },
): { W: number; U: number; V: number } {
  const Wstar = 25 * Math.pow(Math.max(1, Y), 1 / 3) - 17;
  const Ustar = 13 * Wstar * (uv.u - whiteUV.u);
  const Vstar = 13 * Wstar * (uv.v - whiteUV.v);

  return { W: Wstar, U: Ustar, V: Vstar };
}

/**
 * Calculate color difference in CIE 1964 W*U*V* space.
 * deltaE = sqrt((deltaU*)^2 + (deltaV*)^2 + (deltaW*)^2)
 */
function deltaE_WUV(
  wuv1: { W: number; U: number; V: number },
  wuv2: { W: number; U: number; V: number },
): number {
  const dW = wuv1.W - wuv2.W;
  const dU = wuv1.U - wuv2.U;
  const dV = wuv1.V - wuv2.V;
  return Math.sqrt(dW * dW + dU * dU + dV * dV);
}

/**
 * Resample arbitrary SPD data to exactly 5nm intervals, 380-780nm.
 * Uses linear interpolation. Returns 81 points.
 */
function resampleTo5nm(spectrum: SpectrumPoint[]): SpectrumPoint[] {
  const sorted = [...spectrum].sort((a, b) => a.wavelength - b.wavelength);
  const result: SpectrumPoint[] = [];

  for (let wl = 380; wl <= 780; wl += 5) {
    // Find bracketing points
    if (wl <= sorted[0].wavelength) {
      result.push({ wavelength: wl, intensity: sorted[0].intensity });
      continue;
    }
    if (wl >= sorted[sorted.length - 1].wavelength) {
      result.push({ wavelength: wl, intensity: sorted[sorted.length - 1].intensity });
      continue;
    }

    // Linear interpolation
    let j = 0;
    while (j < sorted.length - 1 && sorted[j + 1].wavelength < wl) {
      j++;
    }

    const w1 = sorted[j].wavelength;
    const w2 = sorted[j + 1].wavelength;
    const i1 = sorted[j].intensity;
    const i2 = sorted[j + 1].intensity;

    const t = (wl - w1) / (w2 - w1);
    result.push({ wavelength: wl, intensity: i1 + t * (i2 - i1) });
  }

  return result;
}

/**
 * Calculate CRI (Color Rendering Index) for a given test source SPD.
 *
 * @param testSpectrum - SPD of the test light source
 * @returns CRI result with Ra and individual Ri values
 */
export function calculateCRI(testSpectrum: SpectrumPoint[]): CRIResult {
  // Step 0: Resample test spectrum to 5nm intervals
  const testSPD = resampleTo5nm(testSpectrum);

  // Step 1: Calculate chromaticity and CCT of the test source
  const testXYZ = illuminantToXYZ(testSPD);
  const sumTest = testXYZ.X + testXYZ.Y + testXYZ.Z;
  const testX = sumTest > 0 ? testXYZ.X / sumTest : 0.3127;
  const testY = sumTest > 0 ? testXYZ.Y / sumTest : 0.3290;
  const cct = calculateCCT(testX, testY);

  // Step 2: Get reference illuminant at same CCT
  const refSPD = getReferenceIlluminant(cct);
  const referenceType = cct < 5000 ? 'planckian' as const : 'D-series' as const;

  // Step 3: Calculate white points in CIE 1960 UCS
  const refXYZ = illuminantToXYZ(refSPD);
  const testWhiteUV = xyzToUCS(testXYZ);
  const refWhiteUV = xyzToUCS(refXYZ);

  // Step 4: For each TCS, calculate color under test and reference
  const Ri: number[] = [];

  for (let tcsIdx = 0; tcsIdx < 14; tcsIdx++) {
    const reflectance = TCS_REFLECTANCE[tcsIdx];

    // Color of TCS under test source
    const tcsTestXYZ = spectrumReflectanceToXYZ(testSPD, reflectance);
    const tcsTestUV = xyzToUCS(tcsTestXYZ);

    // Color of TCS under reference illuminant
    const tcsRefXYZ = spectrumReflectanceToXYZ(refSPD, reflectance);
    const tcsRefUV = xyzToUCS(tcsRefXYZ);

    // Step 5: Apply Von Kries chromatic adaptation to test source result
    const adaptedUV = vonKriesAdapt(tcsTestUV, testWhiteUV, refWhiteUV);

    // Step 6: Convert to CIE 1964 W*U*V*
    // Y value for the adapted sample: approximate using tcsTestXYZ.Y
    const wuvAdapted = toWUV(adaptedUV, tcsTestXYZ.Y, refWhiteUV);
    const wuvRef = toWUV(tcsRefUV, tcsRefXYZ.Y, refWhiteUV);

    // Step 7: Calculate delta E
    const dE = deltaE_WUV(wuvAdapted, wuvRef);

    // Step 8: Calculate Ri
    const ri = 100 - 4.6 * dE;
    Ri.push(ri);
  }

  // Ra = average of R1..R8 (first 8 TCS only)
  const Ra = Ri.slice(0, 8).reduce((sum, r) => sum + r, 0) / 8;

  return {
    Ra: Math.round(Ra * 10) / 10,
    Ri: Ri.map((r) => Math.round(r * 10) / 10),
    cct: Math.round(cct),
    referenceType,
  };
}
