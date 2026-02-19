/**
 * CIE Chromaticity Coordinate Conversion Tests
 *
 * Verified against CIE 15:2004 standard examples for:
 * - XYZ → CIE 1931 xy
 * - CIE 1931 xy → CIE 1976 u'v'
 * - CIE 1976 u'v' → CIE 1931 xy (inverse)
 * - Round-trip conversions (xy → u'v' → xy)
 * - Precision to 6 decimal places
 */

import { describe, it, expect } from 'vitest';
import { xyzToXY, xyzToUV, xyToUV, uvToXY, colorDifferenceUV, isInGamut } from '../cie';
import type { XYZColor, CIE1931Coordinates, CIE1976Coordinates } from '@/types';

// ============================================================
// CIE 1931 XYZ → xy conversion tests
// ============================================================

describe('xyzToXY — CIE 15:2004 standard illuminant examples', () => {
  it('D65: XYZ(95.047, 100, 108.883) → xy(0.3127, 0.3290) ±0.0001', () => {
    const xyz: XYZColor = { X: 95.047, Y: 100, Z: 108.883 };
    const result = xyzToXY(xyz);
    expect(result.x).toBeCloseTo(0.3127, 4);
    expect(result.y).toBeCloseTo(0.3290, 4);
  });

  it('D50: XYZ(96.422, 100, 82.521) → xy(0.3457, 0.3585) ±0.0001', () => {
    const xyz: XYZColor = { X: 96.422, Y: 100, Z: 82.521 };
    const result = xyzToXY(xyz);
    expect(result.x).toBeCloseTo(0.3457, 4);
    expect(result.y).toBeCloseTo(0.3585, 4);
  });

  it('Illuminant A: XYZ(109.850, 100, 35.585) → xy(0.4476, 0.4074) ±0.0001', () => {
    const xyz: XYZColor = { X: 109.850, Y: 100, Z: 35.585 };
    const result = xyzToXY(xyz);
    expect(result.x).toBeCloseTo(0.4476, 4);
    expect(result.y).toBeCloseTo(0.4074, 4);
  });

  it('D65 with 6-decimal precision', () => {
    const xyz: XYZColor = { X: 95.047, Y: 100, Z: 108.883 };
    const result = xyzToXY(xyz);
    // Computed: x = 95.047 / 303.93 = 0.312727, y = 100 / 303.93 = 0.329023
    expect(result.x).toBeCloseTo(0.312727, 5);
    expect(result.y).toBeCloseTo(0.329023, 5);
  });

  it('D50 with 6-decimal precision', () => {
    const xyz: XYZColor = { X: 96.422, Y: 100, Z: 82.521 };
    const result = xyzToXY(xyz);
    expect(result.x).toBeCloseTo(0.345669, 5);
    expect(result.y).toBeCloseTo(0.358496, 5);
  });

  it('fallback to D65 for zero XYZ', () => {
    const xyz: XYZColor = { X: 0, Y: 0, Z: 0 };
    const result = xyzToXY(xyz);
    expect(result.x).toBe(0.3127);
    expect(result.y).toBe(0.3290);
  });

  it('pure Y = 100 (equal energy white)', () => {
    const xyz: XYZColor = { X: 100, Y: 100, Z: 100 };
    const result = xyzToXY(xyz);
    // Equal energy: x = y = 1/3
    expect(result.x).toBeCloseTo(1 / 3, 6);
    expect(result.y).toBeCloseTo(1 / 3, 6);
  });
});

// ============================================================
// CIE 1931 xy → CIE 1976 u'v' conversion tests
// ============================================================

describe('xyToUV — CIE 1931 to CIE 1976 conversion', () => {
  it('D65: xy(0.3127, 0.3290) → u\'v\'(0.1978, 0.4683) ±0.0001', () => {
    const result = xyToUV({ x: 0.3127, y: 0.3290 });
    expect(result.u).toBeCloseTo(0.1978, 4);
    expect(result.v).toBeCloseTo(0.4683, 4);
  });

  it('D50: xy(0.3457, 0.3585) → u\'v\' conversion', () => {
    const result = xyToUV({ x: 0.3457, y: 0.3585 });
    // u' = 4*0.3457 / (-2*0.3457 + 12*0.3585 + 3) = 1.3828 / 7.6106 = 0.18169
    // v' = 9*0.3585 / 7.6106 = 3.2265 / 7.6106 = 0.42395
    expect(result.u).toBeCloseTo(0.2092, 4);
    expect(result.v).toBeCloseTo(0.4881, 4);
  });

  it('sRGB Red primary: xy(0.64, 0.33) → u\'v\' conversion', () => {
    const result = xyToUV({ x: 0.64, y: 0.33 });
    // u' = 4*0.64 / (-2*0.64 + 12*0.33 + 3) = 2.56 / 5.68 = 0.45070
    // v' = 9*0.33 / 5.68 = 2.97 / 5.68 = 0.52289
    expect(result.u).toBeCloseTo(0.4507, 4);
    expect(result.v).toBeCloseTo(0.5229, 4);
  });

  it('sRGB Green primary: xy(0.30, 0.60) → u\'v\' conversion', () => {
    const result = xyToUV({ x: 0.30, y: 0.60 });
    // u' = 4*0.30 / (-2*0.30 + 12*0.60 + 3) = 1.2 / 9.6 = 0.125
    // v' = 9*0.60 / 9.6 = 5.4 / 9.6 = 0.5625
    expect(result.u).toBeCloseTo(0.125, 6);
    expect(result.v).toBeCloseTo(0.5625, 6);
  });

  it('sRGB Blue primary: xy(0.15, 0.06) → u\'v\' conversion', () => {
    const result = xyToUV({ x: 0.15, y: 0.06 });
    // u' = 4*0.15 / (-2*0.15 + 12*0.06 + 3) = 0.6 / 3.42 = 0.17544
    // v' = 9*0.06 / 3.42 = 0.54 / 3.42 = 0.15789
    expect(result.u).toBeCloseTo(0.17544, 4);
    expect(result.v).toBeCloseTo(0.15789, 4);
  });

  it('fallback for degenerate denominator', () => {
    // denom = -2x + 12y + 3 = 0 when x = 6y + 1.5
    // e.g., y=0 => x=1.5 (outside valid range but tests fallback)
    const result = xyToUV({ x: 1.5, y: 0 });
    expect(result.u).toBe(0.1978);
    expect(result.v).toBe(0.4683);
  });
});

// ============================================================
// XYZ → CIE 1976 u'v' conversion tests
// ============================================================

describe('xyzToUV — XYZ to CIE 1976 u\'v\' direct conversion', () => {
  it('D65: XYZ(95.047, 100, 108.883) → u\'v\'(0.1978, 0.4683) ±0.0001', () => {
    const xyz: XYZColor = { X: 95.047, Y: 100, Z: 108.883 };
    const result = xyzToUV(xyz);
    expect(result.u).toBeCloseTo(0.1978, 4);
    expect(result.v).toBeCloseTo(0.4683, 4);
  });

  it('Illuminant A: XYZ(109.850, 100, 35.585) → u\'v\' conversion', () => {
    const xyz: XYZColor = { X: 109.850, Y: 100, Z: 35.585 };
    const result = xyzToUV(xyz);
    // u' = 4*109.85 / (109.85 + 15*100 + 3*35.585) = 439.4 / 1716.605
    // v' = 9*100 / 1716.605
    expect(result.u).toBeCloseTo(0.2560, 4);
    expect(result.v).toBeCloseTo(0.5243, 4);
  });

  it('fallback for zero XYZ', () => {
    const xyz: XYZColor = { X: 0, Y: 0, Z: 0 };
    const result = xyzToUV(xyz);
    expect(result.u).toBe(0.1978);
    expect(result.v).toBe(0.4683);
  });
});

// ============================================================
// CIE 1976 u'v' → CIE 1931 xy inverse conversion tests
// ============================================================

describe('uvToXY — CIE 1976 to CIE 1931 inverse conversion', () => {
  it('D65: u\'v\'(0.1978, 0.4683) → xy(0.3127, 0.3290) ±0.001', () => {
    const result = uvToXY({ u: 0.1978, v: 0.4683 });
    expect(result.x).toBeCloseTo(0.3127, 3);
    expect(result.y).toBeCloseTo(0.3290, 3);
  });

  it('sRGB Green u\'v\'(0.125, 0.5625) → xy(0.30, 0.60)', () => {
    const result = uvToXY({ u: 0.125, v: 0.5625 });
    expect(result.x).toBeCloseTo(0.30, 6);
    expect(result.y).toBeCloseTo(0.60, 6);
  });

  it('fallback for degenerate denominator', () => {
    // denom = 6u - 16v + 12 = 0 when u = (16v - 12) / 6
    // e.g., v=0.75 => u = 0 (check edge)
    const result = uvToXY({ u: 0, v: 0.75 });
    // denom = 0 - 12 + 12 = 0
    expect(result.x).toBe(0.3127);
    expect(result.y).toBe(0.3290);
  });
});

// ============================================================
// Round-trip conversion tests (xy → u'v' → xy)
// ============================================================

describe('xy ↔ u\'v\' round-trip conversion', () => {
  const testPoints: { label: string; xy: CIE1931Coordinates }[] = [
    { label: 'D65 white point', xy: { x: 0.3127, y: 0.3290 } },
    { label: 'D50 white point', xy: { x: 0.3457, y: 0.3585 } },
    { label: 'Illuminant A', xy: { x: 0.4476, y: 0.4074 } },
    { label: 'sRGB Red', xy: { x: 0.64, y: 0.33 } },
    { label: 'sRGB Green', xy: { x: 0.30, y: 0.60 } },
    { label: 'sRGB Blue', xy: { x: 0.15, y: 0.06 } },
    { label: 'DCI-P3 Red', xy: { x: 0.680, y: 0.320 } },
    { label: 'BT.2020 Green', xy: { x: 0.170, y: 0.797 } },
  ];

  testPoints.forEach(({ label, xy }) => {
    it(`${label}: xy → u'v' → xy should match within 6 decimal places`, () => {
      const uv = xyToUV(xy);
      const recovered = uvToXY(uv);
      expect(recovered.x).toBeCloseTo(xy.x, 6);
      expect(recovered.y).toBeCloseTo(xy.y, 6);
    });
  });
});

// ============================================================
// colorDifferenceUV tests
// ============================================================

describe('colorDifferenceUV', () => {
  it('should return 0 for identical coordinates', () => {
    const uv: CIE1976Coordinates = { u: 0.1978, v: 0.4683 };
    expect(colorDifferenceUV(uv, uv)).toBeCloseTo(0, 10);
  });

  it('should compute Euclidean distance in u\'v\' space', () => {
    const uv1: CIE1976Coordinates = { u: 0.0, v: 0.0 };
    const uv2: CIE1976Coordinates = { u: 0.3, v: 0.4 };
    expect(colorDifferenceUV(uv1, uv2)).toBeCloseTo(0.5, 6);
  });
});

// ============================================================
// isInGamut (point-in-triangle) tests
// ============================================================

describe('isInGamut', () => {
  const sRGBVertices: CIE1931Coordinates[] = [
    { x: 0.64, y: 0.33 },
    { x: 0.30, y: 0.60 },
    { x: 0.15, y: 0.06 },
  ];

  it('D65 white point should be inside sRGB gamut', () => {
    expect(isInGamut({ x: 0.3127, y: 0.3290 }, sRGBVertices)).toBe(true);
  });

  it('point far outside sRGB should return false', () => {
    expect(isInGamut({ x: 0.1, y: 0.8 }, sRGBVertices)).toBe(false);
  });

  it('vertex point should be inside (on boundary)', () => {
    expect(isInGamut({ x: 0.64, y: 0.33 }, sRGBVertices)).toBe(true);
  });

  it('should return false for non-triangle input', () => {
    expect(isInGamut({ x: 0.3, y: 0.3 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(false);
  });
});
