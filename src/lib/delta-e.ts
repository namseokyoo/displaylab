/**
 * Delta E Color Difference Calculations
 *
 * Implements CIE76, CIE94, and CIEDE2000 color difference formulas.
 * CIEDE2000 follows Sharma, Wu, Dalal (2005) reference implementation.
 *
 * All functions accept CIE L*a*b* color values.
 */

import type { LabColor } from '@/types';

/**
 * CIE76 (ΔE*ab) — Simple Euclidean distance in Lab space
 *
 * ΔE*ab = sqrt((ΔL*)² + (Δa*)² + (Δb*)²)
 */
export function deltaE76(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * CIE94 (ΔE*94) — Weighted Euclidean distance
 *
 * Default: Graphic arts application (kL=1, K1=0.045, K2=0.015)
 * Textile application would be (kL=2, K1=0.048, K2=0.014)
 */
export function deltaE94(
  lab1: LabColor,
  lab2: LabColor,
  options?: { kL?: number; K1?: number; K2?: number },
): number {
  const kL = options?.kL ?? 1;
  const K1 = options?.K1 ?? 0.045;
  const K2 = options?.K2 ?? 0.015;

  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;

  const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const dC = C1 - C2;

  // ΔH² = Δa² + Δb² - ΔC²
  const dH2 = da * da + db * db - dC * dC;
  // Guard against floating-point rounding producing negative values
  const dH = Math.sqrt(Math.max(0, dH2));

  const SL = 1;
  const SC = 1 + K1 * C1;
  const SH = 1 + K2 * C1;

  const termL = dL / (kL * SL);
  const termC = dC / SC;
  const termH = dH / SH;

  return Math.sqrt(termL * termL + termC * termC + termH * termH);
}

/**
 * CIEDE2000 (ΔE00) — Most perceptually uniform color difference formula
 *
 * Implementation follows:
 *   Sharma, G., Wu, W., Dalal, E.N. (2005)
 *   "The CIEDE2000 color-difference formula: Implementation notes,
 *    supplementary test data, and mathematical observations"
 *   Color Research and Application, 30(1), 21-30
 *
 * Verified against Sharma et al. 33-pair test data (Table 1).
 *
 * @param kL - Lightness parametric factor (default 1)
 * @param kC - Chroma parametric factor (default 1)
 * @param kH - Hue parametric factor (default 1)
 */
export function deltaE2000(
  lab1: LabColor,
  lab2: LabColor,
  kL: number = 1,
  kC: number = 1,
  kH: number = 1,
): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  // Step 1: Calculate C'ab and h'ab
  const C1ab = Math.sqrt(a1 * a1 + b1 * b1);
  const C2ab = Math.sqrt(a2 * a2 + b2 * b2);
  const CabBar = (C1ab + C2ab) / 2;

  const CabBar7 = Math.pow(CabBar, 7);
  const G = 0.5 * (1 - Math.sqrt(CabBar7 / (CabBar7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = (Math.atan2(b1, a1p) * 180) / Math.PI;
  if (h1p < 0) h1p += 360;

  let h2p = (Math.atan2(b2, a2p) * 180) / Math.PI;
  if (h2p < 0) h2p += 360;

  // Step 2: Calculate ΔL', ΔC', ΔH'
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(((dhp / 2) * Math.PI) / 180);

  // Step 3: Calculate CIEDE2000 ΔE00
  const Lp_bar = (L1 + L2) / 2;
  const Cp_bar = (C1p + C2p) / 2;

  let hp_bar: number;
  if (C1p * C2p === 0) {
    hp_bar = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hp_bar = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hp_bar = (h1p + h2p + 360) / 2;
  } else {
    hp_bar = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(((hp_bar - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * hp_bar) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hp_bar + 6) * Math.PI) / 180) -
    0.20 * Math.cos(((4 * hp_bar - 63) * Math.PI) / 180);

  const Lp_bar_minus_50_sq = (Lp_bar - 50) * (Lp_bar - 50);
  const SL = 1 + 0.015 * Lp_bar_minus_50_sq / Math.sqrt(20 + Lp_bar_minus_50_sq);
  const SC = 1 + 0.045 * Cp_bar;
  const SH = 1 + 0.015 * Cp_bar * T;

  const Cp_bar7 = Math.pow(Cp_bar, 7);
  const RC = 2 * Math.sqrt(Cp_bar7 / (Cp_bar7 + Math.pow(25, 7)));

  const dTheta =
    30 * Math.exp(-Math.pow((hp_bar - 275) / 25, 2));
  const RT = -Math.sin(((2 * dTheta) * Math.PI) / 180) * RC;

  const termL = dLp / (kL * SL);
  const termC = dCp / (kC * SC);
  const termH = dHp / (kH * SH);

  return Math.sqrt(
    termL * termL + termC * termC + termH * termH + RT * termC * termH,
  );
}
