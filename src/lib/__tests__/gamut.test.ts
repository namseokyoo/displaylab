/**
 * Color Gamut Calculation Tests
 *
 * - Shoelace formula triangle area verification
 * - sRGB / DCI-P3 / BT.2020 gamut area in CIE 1931 xy and CIE 1976 u'v'
 * - Coverage calculation verification
 * - Gamut area cross-validation with known reference values
 */

import { describe, it, expect } from 'vitest';
import {
  triangleArea,
  calculateGamutAreaXY,
  calculateGamutAreaUV,
  calculateGamutArea,
  calculateCoverage,
  calculateAllCoverages,
  isValidCIExy,
  areValidPrimaries,
} from '../gamut';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import type { GamutData } from '@/types';

// ============================================================
// Shoelace formula unit tests
// ============================================================

describe('triangleArea — Shoelace formula', () => {
  it('unit right triangle: area = 0.5', () => {
    const area = triangleArea({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 });
    expect(area).toBeCloseTo(0.5, 10);
  });

  it('equilateral-like triangle with known area', () => {
    // Triangle with vertices (0,0), (4,0), (2,3)
    // Area = 0.5 * |0*(0-3) + 4*(3-0) + 2*(0-0)| = 0.5 * 12 = 6
    const area = triangleArea({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 });
    expect(area).toBeCloseTo(6.0, 10);
  });

  it('degenerate triangle (collinear points): area = 0', () => {
    const area = triangleArea({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 });
    expect(area).toBeCloseTo(0, 10);
  });

  it('vertex ordering should not affect area (absolute value)', () => {
    const p1 = { x: 0.64, y: 0.33 };
    const p2 = { x: 0.30, y: 0.60 };
    const p3 = { x: 0.15, y: 0.06 };
    const area1 = triangleArea(p1, p2, p3);
    const area2 = triangleArea(p3, p2, p1);
    const area3 = triangleArea(p2, p1, p3);
    expect(area1).toBeCloseTo(area2, 10);
    expect(area1).toBeCloseTo(area3, 10);
  });
});

// ============================================================
// sRGB gamut area in CIE 1931 xy
// ============================================================

describe('calculateGamutAreaXY — CIE 1931 xy areas', () => {
  it('sRGB area in CIE 1931 xy', () => {
    // sRGB primaries: R(0.64, 0.33), G(0.30, 0.60), B(0.15, 0.06)
    // Shoelace: 0.5 * |0.64*(0.60-0.06) + 0.30*(0.06-0.33) + 0.15*(0.33-0.60)|
    //         = 0.5 * |0.3456 + (-0.081) + (-0.0405)| = 0.5 * 0.2241 = 0.11205
    const area = calculateGamutAreaXY(STANDARD_GAMUTS.sRGB.primaries);
    expect(area).toBeCloseTo(0.11205, 5);
  });

  it('DCI-P3 area in CIE 1931 xy', () => {
    // DCI-P3: R(0.680, 0.320), G(0.265, 0.690), B(0.150, 0.060)
    const area = calculateGamutAreaXY(STANDARD_GAMUTS['DCI-P3'].primaries);
    expect(area).toBeCloseTo(0.15200, 4);
  });

  it('BT.2020 area in CIE 1931 xy', () => {
    // BT.2020: R(0.708, 0.292), G(0.170, 0.797), B(0.131, 0.046)
    const area = calculateGamutAreaXY(STANDARD_GAMUTS['BT.2020'].primaries);
    expect(area).toBeCloseTo(0.21187, 4);
  });

  it('Adobe RGB area should be larger than sRGB', () => {
    const sRGBArea = calculateGamutAreaXY(STANDARD_GAMUTS.sRGB.primaries);
    const adobeArea = calculateGamutAreaXY(STANDARD_GAMUTS.AdobeRGB.primaries);
    expect(adobeArea).toBeGreaterThan(sRGBArea);
  });

  it('BT.2020 should be larger than DCI-P3', () => {
    const p3Area = calculateGamutAreaXY(STANDARD_GAMUTS['DCI-P3'].primaries);
    const bt2020Area = calculateGamutAreaXY(STANDARD_GAMUTS['BT.2020'].primaries);
    expect(bt2020Area).toBeGreaterThan(p3Area);
  });

  it('NTSC area in CIE 1931 xy', () => {
    const area = calculateGamutAreaXY(STANDARD_GAMUTS.NTSC.primaries);
    // NTSC: R(0.67, 0.33), G(0.21, 0.71), B(0.14, 0.08)
    expect(area).toBeGreaterThan(0.1);
    expect(area).toBeLessThan(0.25);
  });
});

// ============================================================
// Gamut area in CIE 1976 u'v'
// ============================================================

describe('calculateGamutAreaUV — CIE 1976 u\'v\' areas', () => {
  it('sRGB area in CIE 1976 u\'v\'', () => {
    // Pre-computed sRGB u'v' area: ~0.06489
    const area = calculateGamutAreaUV(STANDARD_GAMUTS.sRGB.primaries);
    expect(area).toBeCloseTo(0.06489, 4);
  });

  it('DCI-P3 area in CIE 1976 u\'v\'', () => {
    const area = calculateGamutAreaUV(STANDARD_GAMUTS['DCI-P3'].primaries);
    expect(area).toBeCloseTo(0.08148, 4);
  });

  it('BT.2020 area in CIE 1976 u\'v\'', () => {
    const area = calculateGamutAreaUV(STANDARD_GAMUTS['BT.2020'].primaries);
    expect(area).toBeCloseTo(0.11182, 4);
  });

  it('ordering: sRGB < DCI-P3 < BT.2020 in u\'v\'', () => {
    const srgb = calculateGamutAreaUV(STANDARD_GAMUTS.sRGB.primaries);
    const p3 = calculateGamutAreaUV(STANDARD_GAMUTS['DCI-P3'].primaries);
    const bt2020 = calculateGamutAreaUV(STANDARD_GAMUTS['BT.2020'].primaries);
    expect(srgb).toBeLessThan(p3);
    expect(p3).toBeLessThan(bt2020);
  });
});

// ============================================================
// calculateGamutArea (mode selector)
// ============================================================

describe('calculateGamutArea — mode-aware calculation', () => {
  it('CIE1931 mode returns xy area', () => {
    const area = calculateGamutArea(STANDARD_GAMUTS.sRGB.primaries, 'CIE1931');
    const expected = calculateGamutAreaXY(STANDARD_GAMUTS.sRGB.primaries);
    expect(area).toBe(expected);
  });

  it('CIE1976 mode returns u\'v\' area', () => {
    const area = calculateGamutArea(STANDARD_GAMUTS.sRGB.primaries, 'CIE1976');
    const expected = calculateGamutAreaUV(STANDARD_GAMUTS.sRGB.primaries);
    expect(area).toBe(expected);
  });

  it('default mode is CIE1931', () => {
    const area = calculateGamutArea(STANDARD_GAMUTS.sRGB.primaries);
    const expected = calculateGamutAreaXY(STANDARD_GAMUTS.sRGB.primaries);
    expect(area).toBe(expected);
  });
});

// ============================================================
// Coverage calculation tests
// ============================================================

describe('calculateCoverage', () => {
  it('sRGB vs sRGB = 100%', () => {
    const coverage = calculateCoverage(
      STANDARD_GAMUTS.sRGB.primaries,
      STANDARD_GAMUTS.sRGB.primaries,
    );
    expect(coverage).toBeCloseTo(100.0, 4);
  });

  it('DCI-P3 vs sRGB > 100% (wider gamut)', () => {
    const coverage = calculateCoverage(
      STANDARD_GAMUTS['DCI-P3'].primaries,
      STANDARD_GAMUTS.sRGB.primaries,
    );
    expect(coverage).toBeGreaterThan(100);
  });

  it('sRGB vs DCI-P3 < 100% (narrower gamut)', () => {
    const coverage = calculateCoverage(
      STANDARD_GAMUTS.sRGB.primaries,
      STANDARD_GAMUTS['DCI-P3'].primaries,
    );
    expect(coverage).toBeLessThan(100);
    expect(coverage).toBeGreaterThan(50);
  });

  it('BT.2020 vs sRGB coverage (area ratio)', () => {
    const coverage = calculateCoverage(
      STANDARD_GAMUTS['BT.2020'].primaries,
      STANDARD_GAMUTS.sRGB.primaries,
    );
    // BT.2020 is much larger than sRGB
    expect(coverage).toBeGreaterThan(180);
  });

  it('zero-area standard should return 0 coverage', () => {
    const degeneratePrimaries: GamutData['primaries'] = {
      red: { x: 0, y: 0 },
      green: { x: 0, y: 0 },
      blue: { x: 0, y: 0 },
    };
    const coverage = calculateCoverage(
      STANDARD_GAMUTS.sRGB.primaries,
      degeneratePrimaries,
    );
    expect(coverage).toBe(0);
  });
});

// ============================================================
// calculateAllCoverages
// ============================================================

describe('calculateAllCoverages', () => {
  it('should return entries for all standard gamuts', () => {
    const entries = calculateAllCoverages(STANDARD_GAMUTS.sRGB.primaries);
    expect(entries.length).toBe(Object.keys(STANDARD_GAMUTS).length);
  });

  it('sRGB vs sRGB entry should be ~100%', () => {
    const entries = calculateAllCoverages(STANDARD_GAMUTS.sRGB.primaries);
    const sRGBEntry = entries.find((e) => e.standardName === 'sRGB');
    expect(sRGBEntry).toBeDefined();
    expect(sRGBEntry!.coverageXY).toBeCloseTo(100.0, 2);
    expect(sRGBEntry!.coverageUV).toBeCloseTo(100.0, 2);
  });
});

// ============================================================
// Coordinate validation tests
// ============================================================

describe('isValidCIExy', () => {
  it('valid sRGB red primary', () => {
    expect(isValidCIExy(0.64, 0.33)).toBe(true);
  });

  it('origin (0,0) is valid', () => {
    expect(isValidCIExy(0, 0)).toBe(true);
  });

  it('negative x is invalid', () => {
    expect(isValidCIExy(-0.1, 0.3)).toBe(false);
  });

  it('x + y > 1 is invalid', () => {
    expect(isValidCIExy(0.7, 0.5)).toBe(false);
  });
});

describe('areValidPrimaries', () => {
  it('sRGB primaries are valid', () => {
    expect(areValidPrimaries(STANDARD_GAMUTS.sRGB.primaries)).toBe(true);
  });

  it('invalid primaries with negative coordinate', () => {
    const bad: GamutData['primaries'] = {
      red: { x: -0.1, y: 0.3 },
      green: { x: 0.30, y: 0.60 },
      blue: { x: 0.15, y: 0.06 },
    };
    expect(areValidPrimaries(bad)).toBe(false);
  });
});
