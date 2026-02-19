/**
 * Color Conversion Tests
 *
 * - XYZ → Lab (CIE 15:2004 reference)
 * - Lab → XYZ (inverse)
 * - XYZ → Lab → XYZ round-trip
 * - XYZ → RGB → hex
 * - xyY → XYZ conversion
 */

import { describe, it, expect } from 'vitest';
import { xyzToLab, labToXyz, xyzToRGB, rgbToHex, xyzToHex, xyYToXYZ } from '../color-convert';
import type { XYZColor } from '@/types';

const D65_WHITE: XYZColor = { X: 95.047, Y: 100.0, Z: 108.883 };

// ============================================================
// XYZ → Lab conversion tests (CIE 15:2004)
// ============================================================

describe('xyzToLab — CIE 15:2004 standard', () => {
  it('D65 white point → Lab(100, 0, 0)', () => {
    const result = xyzToLab({ X: 95.047, Y: 100, Z: 108.883 });
    expect(result.L).toBeCloseTo(100, 4);
    expect(result.a).toBeCloseTo(0, 4);
    expect(result.b).toBeCloseTo(0, 4);
  });

  it('perfect black XYZ(0,0,0) → Lab(0, 0, 0)', () => {
    const result = xyzToLab({ X: 0, Y: 0, Z: 0 });
    expect(result.L).toBeCloseTo(0, 4);
    expect(result.a).toBeCloseTo(0, 4);
    expect(result.b).toBeCloseTo(0, 4);
  });

  it('mid gray XYZ(20.517, 21.586, 23.507) → Lab ~ (53.585, 0, 0)', () => {
    const result = xyzToLab({ X: 20.517, Y: 21.586, Z: 23.507 });
    expect(result.L).toBeCloseTo(53.585, 2);
    // a and b should be very near 0 for a neutral gray
    expect(Math.abs(result.a)).toBeLessThan(0.1);
    expect(Math.abs(result.b)).toBeLessThan(0.1);
  });

  it('sRGB pure red XYZ(41.24, 21.26, 1.93) → Lab(53.233, 80.109, 67.220)', () => {
    const result = xyzToLab({ X: 41.24, Y: 21.26, Z: 1.93 });
    expect(result.L).toBeCloseTo(53.233, 2);
    expect(result.a).toBeCloseTo(80.109, 2);
    expect(result.b).toBeCloseTo(67.220, 2);
  });

  it('dark color XYZ(3, 2, 5) → Lab(15.487, 22.294, -17.331)', () => {
    const result = xyzToLab({ X: 3, Y: 2, Z: 5 });
    expect(result.L).toBeCloseTo(15.487, 2);
    expect(result.a).toBeCloseTo(22.294, 2);
    expect(result.b).toBeCloseTo(-17.331, 2);
  });

  it('half-luminance XYZ(47.5235, 50, 54.4415) → L* near 76.069', () => {
    // Y/Yn = 0.5, so L* = 116 * 0.5^(1/3) - 16 = 76.069
    const result = xyzToLab({ X: 50, Y: 50, Z: 50 });
    expect(result.L).toBeCloseTo(76.069, 2);
  });

  it('custom white point: D50', () => {
    const D50: XYZColor = { X: 96.422, Y: 100, Z: 82.521 };
    const result = xyzToLab({ X: 96.422, Y: 100, Z: 82.521 }, D50);
    expect(result.L).toBeCloseTo(100, 4);
    expect(result.a).toBeCloseTo(0, 4);
    expect(result.b).toBeCloseTo(0, 4);
  });
});

// ============================================================
// Lab → XYZ inverse conversion tests
// ============================================================

describe('labToXyz — inverse of xyzToLab', () => {
  it('Lab(100, 0, 0) → D65 white point', () => {
    const result = labToXyz({ L: 100, a: 0, b: 0 });
    expect(result.X).toBeCloseTo(D65_WHITE.X, 2);
    expect(result.Y).toBeCloseTo(D65_WHITE.Y, 2);
    expect(result.Z).toBeCloseTo(D65_WHITE.Z, 2);
  });

  it('Lab(0, 0, 0) → XYZ(0, 0, 0)', () => {
    const result = labToXyz({ L: 0, a: 0, b: 0 });
    expect(result.X).toBeCloseTo(0, 2);
    expect(result.Y).toBeCloseTo(0, 2);
    expect(result.Z).toBeCloseTo(0, 2);
  });

  it('Lab(53.233, 80.109, 67.220) → XYZ ~ (41.24, 21.26, 1.93) (sRGB Red)', () => {
    const result = labToXyz({ L: 53.233, a: 80.109, b: 67.220 });
    expect(result.X).toBeCloseTo(41.24, 1);
    expect(result.Y).toBeCloseTo(21.26, 1);
    expect(result.Z).toBeCloseTo(1.93, 1);
  });
});

// ============================================================
// XYZ → Lab → XYZ round-trip tests
// ============================================================

describe('XYZ ↔ Lab round-trip', () => {
  const testCases: { label: string; xyz: XYZColor }[] = [
    { label: 'D65 white point', xyz: { X: 95.047, Y: 100, Z: 108.883 } },
    { label: 'sRGB Red', xyz: { X: 41.24, Y: 21.26, Z: 1.93 } },
    { label: 'sRGB Green', xyz: { X: 35.76, Y: 71.52, Z: 11.92 } },
    { label: 'sRGB Blue', xyz: { X: 18.05, Y: 7.22, Z: 95.05 } },
    { label: 'mid gray', xyz: { X: 20.517, Y: 21.586, Z: 23.507 } },
    { label: 'dark color', xyz: { X: 3, Y: 2, Z: 5 } },
    { label: 'bright cyan', xyz: { X: 53.81, Y: 78.74, Z: 106.97 } },
  ];

  testCases.forEach(({ label, xyz }) => {
    it(`${label}: XYZ → Lab → XYZ should match within 4 decimal places`, () => {
      const lab = xyzToLab(xyz);
      const recovered = labToXyz(lab);
      expect(recovered.X).toBeCloseTo(xyz.X, 4);
      expect(recovered.Y).toBeCloseTo(xyz.Y, 4);
      expect(recovered.Z).toBeCloseTo(xyz.Z, 4);
    });
  });
});

// ============================================================
// XYZ → RGB conversion tests
// ============================================================

describe('xyzToRGB', () => {
  it('D65 white → RGB(255, 255, 255) approximately', () => {
    const result = xyzToRGB({ X: 95.047, Y: 100, Z: 108.883 });
    expect(result.r).toBeGreaterThanOrEqual(254);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(254);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(254);
    expect(result.b).toBeLessThanOrEqual(255);
  });

  it('black XYZ(0,0,0) → RGB(0, 0, 0)', () => {
    const result = xyzToRGB({ X: 0, Y: 0, Z: 0 });
    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('sRGB Red XYZ → RGB(255, 0, 0) approximately', () => {
    // sRGB (1,0,0) in XYZ (D65)
    const result = xyzToRGB({ X: 41.24, Y: 21.26, Z: 1.93 });
    expect(result.r).toBeGreaterThanOrEqual(253);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeLessThanOrEqual(5);
    expect(result.b).toBeLessThanOrEqual(5);
  });

  it('values are clamped to 0-255', () => {
    // Out-of-gamut XYZ should still produce valid 0-255 values
    const result = xyzToRGB({ X: 200, Y: 100, Z: 10 });
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeGreaterThanOrEqual(0);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeGreaterThanOrEqual(0);
    expect(result.b).toBeLessThanOrEqual(255);
  });
});

// ============================================================
// RGB → hex conversion tests
// ============================================================

describe('rgbToHex', () => {
  it('white: RGB(255,255,255) → #FFFFFF', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
  });

  it('black: RGB(0,0,0) → #000000', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  it('red: RGB(255,0,0) → #FF0000', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
  });

  it('specific color: RGB(18, 52, 86) → #123456', () => {
    expect(rgbToHex(18, 52, 86)).toBe('#123456');
  });
});

// ============================================================
// XYZ → hex conversion tests
// ============================================================

describe('xyzToHex', () => {
  it('black XYZ → #000000', () => {
    expect(xyzToHex({ X: 0, Y: 0, Z: 0 })).toBe('#000000');
  });

  it('D65 white → near #FFFFFF', () => {
    const hex = xyzToHex({ X: 95.047, Y: 100, Z: 108.883 });
    // Should be very close to white
    expect(hex).toMatch(/^#F[A-F0-9]{5}$/);
  });
});

// ============================================================
// xyY → XYZ conversion tests
// ============================================================

describe('xyYToXYZ', () => {
  it('D65: xy(0.3127, 0.3290), Y=100 → XYZ(95.047, 100, 108.883) ±0.1', () => {
    const result = xyYToXYZ(0.3127, 0.3290, 100);
    expect(result.X).toBeCloseTo(95.047, 0);
    expect(result.Y).toBe(100);
    expect(result.Z).toBeCloseTo(108.883, 0);
  });

  it('D50: xy(0.3457, 0.3585), Y=100 → XYZ(96.422, 100, 82.521) ±0.1', () => {
    const result = xyYToXYZ(0.3457, 0.3585, 100);
    expect(result.X).toBeCloseTo(96.422, 0);
    expect(result.Y).toBe(100);
    expect(result.Z).toBeCloseTo(82.521, 0);
  });

  it('zero y should return zero XYZ', () => {
    const result = xyYToXYZ(0.3127, 0, 100);
    expect(result.X).toBe(0);
    expect(result.Y).toBe(0);
    expect(result.Z).toBe(0);
  });

  it('equal energy: xy(1/3, 1/3), Y=50 → XYZ(50, 50, 50)', () => {
    const result = xyYToXYZ(1 / 3, 1 / 3, 50);
    expect(result.X).toBeCloseTo(50, 4);
    expect(result.Y).toBe(50);
    expect(result.Z).toBeCloseTo(50, 4);
  });

  it('xyY round-trip: XYZ → xy → xyY → XYZ', () => {
    const origXYZ: XYZColor = { X: 41.24, Y: 21.26, Z: 1.93 };
    const sum = origXYZ.X + origXYZ.Y + origXYZ.Z;
    const x = origXYZ.X / sum;
    const y = origXYZ.Y / sum;
    const recovered = xyYToXYZ(x, y, origXYZ.Y);
    expect(recovered.X).toBeCloseTo(origXYZ.X, 4);
    expect(recovered.Y).toBeCloseTo(origXYZ.Y, 4);
    expect(recovered.Z).toBeCloseTo(origXYZ.Z, 4);
  });
});
