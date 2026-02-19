/**
 * CIE Chromaticity Coordinate Conversions
 *
 * Ported from ISCV chromaticity.ts + spectrum-to-xyz.ts (interpolateObserver only).
 */

import type { XYZColor, CIE1931Coordinates, CIE1976Coordinates } from '@/types';
import { CIE1931_OBSERVER } from '@/data/cie1931';

/**
 * Convert XYZ to CIE 1931 xy chromaticity coordinates
 */
export function xyzToXY(xyz: XYZColor): CIE1931Coordinates {
  const { X, Y, Z } = xyz;
  const sum = X + Y + Z;

  if (sum === 0) {
    return { x: 0.3127, y: 0.3290 }; // D65 white point as fallback
  }

  return {
    x: X / sum,
    y: Y / sum,
  };
}

/**
 * Convert XYZ to CIE 1976 u'v' chromaticity coordinates
 */
export function xyzToUV(xyz: XYZColor): CIE1976Coordinates {
  const { X, Y, Z } = xyz;
  const denom = X + 15 * Y + 3 * Z;

  if (denom === 0) {
    return { u: 0.1978, v: 0.4683 }; // D65 white point in u'v'
  }

  return {
    u: (4 * X) / denom,
    v: (9 * Y) / denom,
  };
}

/**
 * Convert CIE 1931 xy to CIE 1976 u'v'
 */
export function xyToUV(xy: CIE1931Coordinates): CIE1976Coordinates {
  const { x, y } = xy;
  const denom = -2 * x + 12 * y + 3;

  if (denom === 0) {
    return { u: 0.1978, v: 0.4683 };
  }

  return {
    u: (4 * x) / denom,
    v: (9 * y) / denom,
  };
}

/**
 * Convert CIE 1976 u'v' to CIE 1931 xy
 */
export function uvToXY(uv: CIE1976Coordinates): CIE1931Coordinates {
  const { u, v } = uv;
  const denom = 6 * u - 16 * v + 12;

  if (denom === 0) {
    return { x: 0.3127, y: 0.3290 };
  }

  return {
    x: (9 * u) / denom,
    y: (4 * v) / denom,
  };
}

/**
 * Calculate color difference (Delta E) in CIE 1976 u'v' space
 */
export function colorDifferenceUV(uv1: CIE1976Coordinates, uv2: CIE1976Coordinates): number {
  const du = uv1.u - uv2.u;
  const dv = uv1.v - uv2.v;
  return Math.sqrt(du * du + dv * dv);
}

/**
 * Check if a chromaticity coordinate is within a color gamut (point-in-triangle)
 */
export function isInGamut(
  point: CIE1931Coordinates,
  gamutVertices: CIE1931Coordinates[],
): boolean {
  if (gamutVertices.length !== 3) {
    return false;
  }

  const [v1, v2, v3] = gamutVertices;

  const denom = (v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y);
  const a = ((v2.y - v3.y) * (point.x - v3.x) + (v3.x - v2.x) * (point.y - v3.y)) / denom;
  const b = ((v3.y - v1.y) * (point.x - v3.x) + (v1.x - v3.x) * (point.y - v3.y)) / denom;
  const c = 1 - a - b;

  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}

/**
 * Interpolate CIE observer function value at a specific wavelength.
 * Uses linear interpolation between 5nm data points.
 * (From ISCV spectrum-to-xyz.ts)
 */
export function interpolateObserver(
  wavelength: number,
  component: 'x' | 'y' | 'z',
): number {
  if (wavelength < 380 || wavelength > 780) {
    return 0;
  }

  const index = (wavelength - 380) / 5;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex || upperIndex >= CIE1931_OBSERVER.length) {
    return CIE1931_OBSERVER[Math.min(lowerIndex, CIE1931_OBSERVER.length - 1)][component];
  }

  const t = index - lowerIndex;
  const lower = CIE1931_OBSERVER[lowerIndex][component];
  const upper = CIE1931_OBSERVER[upperIndex][component];

  return lower + t * (upper - lower);
}
