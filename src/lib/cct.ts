/**
 * Correlated Color Temperature (CCT) and Duv Calculations
 *
 * McCamy's approximation for CCT.
 * Ohno (2014)-style Duv via Planckian locus computation.
 */

import type { CCTResult } from '@/types';

/**
 * Calculate CCT using McCamy's approximation (1992)
 *
 * Accurate for CCT range ~2000K to ~12500K.
 *
 * n = (x - 0.3320) / (0.1858 - y)
 * CCT = 449n^3 + 3525n^2 + 6823.3n + 5520.33
 *
 * Reference: McCamy, C.S. (1992) "Correlated color temperature as an
 * explicit function of chromaticity coordinates"
 */
export function calculateCCT(x: number, y: number): number {
  const n = (x - 0.3320) / (0.1858 - y);
  return 449 * n * n * n + 3525 * n * n + 6823.3 * n + 5520.33;
}

/**
 * Convert CIE 1931 xy to CIE 1960 UCS (u, v)
 * Note: v here is CIE 1960 v (not CIE 1976 v')
 *   u = 4x / (-2x + 12y + 3)
 *   v = 6y / (-2x + 12y + 3)
 */
function xyToUCS(x: number, y: number): { u: number; v: number } {
  const denom = -2 * x + 12 * y + 3;
  if (denom === 0) {
    return { u: 0, v: 0 };
  }
  return {
    u: (4 * x) / denom,
    v: (6 * y) / denom,
  };
}

/**
 * Compute Planckian (blackbody) chromaticity in CIE 1960 UCS for a given temperature.
 *
 * Uses Planck's law to integrate over the visible spectrum (380-780nm, 5nm steps)
 * with the CIE 1931 2-degree standard observer.
 *
 * For speed, we use Kim et al. (2002) rational polynomial approximation instead:
 *   Valid for 1667K <= T <= 25000K
 */
function planckianUCS(T: number): { u: number; v: number } {
  // Kim et al. (2002) approximation for CIE xy from CCT
  // Split into two temperature ranges
  let x: number;
  let y: number;

  if (T >= 1667 && T <= 4000) {
    x =
      -0.2661239e9 / (T * T * T) -
      0.2343589e6 / (T * T) +
      0.8776956e3 / T +
      0.179910;
    if (T <= 2222) {
      y =
        -1.1063814 * x * x * x -
        1.3481102 * x * x +
        2.18555832 * x -
        0.20219683;
    } else {
      y =
        -0.9549476 * x * x * x -
        1.37418593 * x * x +
        2.09137015 * x -
        0.16748867;
    }
  } else if (T > 4000 && T <= 25000) {
    x =
      -3.0258469e9 / (T * T * T) +
      2.1070379e6 / (T * T) +
      0.2226347e3 / T +
      0.24039;
    y =
      3.081758 * x * x * x -
      5.8733867 * x * x +
      3.75112997 * x -
      0.37001483;
  } else {
    // Outside valid range — use rough extrapolation
    x = 0.3127;
    y = 0.3290;
  }

  return xyToUCS(x, y);
}

/**
 * Calculate Duv (distance from Planckian locus)
 *
 * Positive Duv = above the Planckian locus (greenish)
 * Negative Duv = below the Planckian locus (pinkish/magenta)
 *
 * Method: First estimate CCT via McCamy, then compute distance from
 * the Planckian point at that CCT, and determine sign via cross product.
 *
 * Reference: Ohno, Y. (2014) "Practical Use and Calculation of CCT and Duv"
 */
export function calculateDuv(x: number, y: number): number {
  const { u: us, v: vs } = xyToUCS(x, y);

  // Get approximate CCT to find nearby Planckian point
  const cctEst = calculateCCT(x, y);

  // Search around the estimated CCT for the closest point on the Planckian locus
  const searchRange = Math.max(500, cctEst * 0.1);
  const steps = 100;
  const tMin = Math.max(1667, cctEst - searchRange);
  const tMax = Math.min(25000, cctEst + searchRange);
  const dt = (tMax - tMin) / steps;

  let minDist = Infinity;
  let bestT = cctEst;
  let bestU = 0;
  let bestV = 0;

  for (let i = 0; i <= steps; i++) {
    const T = tMin + i * dt;
    const { u: up, v: vp } = planckianUCS(T);
    const du = us - up;
    const dv = vs - vp;
    const dist = Math.sqrt(du * du + dv * dv);
    if (dist < minDist) {
      minDist = dist;
      bestT = T;
      bestU = up;
      bestV = vp;
    }
  }

  // Refine with a finer search around bestT
  const fineRange = dt * 2;
  const fineTMin = Math.max(1667, bestT - fineRange);
  const fineTMax = Math.min(25000, bestT + fineRange);
  const fineDt = (fineTMax - fineTMin) / 100;

  for (let i = 0; i <= 100; i++) {
    const T = fineTMin + i * fineDt;
    const { u: up, v: vp } = planckianUCS(T);
    const du = us - up;
    const dv = vs - vp;
    const dist = Math.sqrt(du * du + dv * dv);
    if (dist < minDist) {
      minDist = dist;
      bestU = up;
      bestV = vp;
    }
  }

  // Determine sign using the tangent of the Planckian locus
  // The locus goes from high-u (warm) to low-u (cool) as T increases.
  // The tangent direction at bestT points toward decreasing u.
  // Cross product of tangent and (point - locus) determines sign.
  const { u: up1, v: vp1 } = planckianUCS(bestT - 50);
  const { u: up2, v: vp2 } = planckianUCS(bestT + 50);

  const tangentU = up2 - up1; // direction along increasing T
  const tangentV = vp2 - vp1;

  const pointU = us - bestU;
  const pointV = vs - bestV;

  // Cross product: tangent x point vector
  // Positive = point is to the left of tangent direction = above locus (green tint)
  const cross = tangentU * pointV - tangentV * pointU;
  const sign = cross >= 0 ? 1 : -1;

  return sign * minDist;
}

/**
 * Calculate both CCT and Duv for a given CIE xy coordinate
 */
export function calculateCCTAndDuv(x: number, y: number): CCTResult {
  return {
    cct: calculateCCT(x, y),
    duv: calculateDuv(x, y),
  };
}

/**
 * Interpret color temperature into human-readable category
 */
export function interpretCCT(cct: number): {
  category: 'warm' | 'neutral' | 'cool';
  description: string;
} {
  if (cct < 3500) {
    return { category: 'warm', description: 'Warm White (< 3500K)' };
  } else if (cct <= 5500) {
    return { category: 'neutral', description: 'Neutral White (3500-5500K)' };
  } else {
    return { category: 'cool', description: 'Cool White / Daylight (> 5500K)' };
  }
}

/** Common illuminant presets in CIE xy coordinates */
export const CCT_PRESETS = {
  D65: { x: 0.3127, y: 0.3290, label: 'D65 (Daylight 6504K)' },
  D50: { x: 0.3457, y: 0.3585, label: 'D50 (Horizon 5003K)' },
  A: { x: 0.4476, y: 0.4074, label: 'Illuminant A (2856K)' },
  C: { x: 0.3101, y: 0.3162, label: 'Illuminant C (6774K)' },
} as const;
