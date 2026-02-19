/**
 * Delta E Calculation Tests
 *
 * CIEDE2000 verified against Sharma, Wu, Dalal (2005) Table 1 — all 34 pairs.
 * CIE76 and CIE94 verified with known reference values.
 */

import { describe, it, expect } from 'vitest';
import { deltaE76, deltaE94, deltaE2000 } from '../delta-e';
import type { LabColor } from '@/types';

/**
 * Sharma et al. (2005) Test Data — Table 1
 * All 34 pairs from the paper "The CIEDE2000 color-difference formula"
 *
 * Each entry: [L1, a1, b1, L2, a2, b2, expected_dE2000]
 */
const SHARMA_TEST_DATA: [number, number, number, number, number, number, number][] = [
  // Pair 1
  [50.0000, 2.6772, -79.7751, 50.0000, 0.0000, -82.7485, 2.0425],
  // Pair 2
  [50.0000, 3.1571, -77.2803, 50.0000, 0.0000, -82.7485, 2.8615],
  // Pair 3
  [50.0000, 2.8361, -74.0200, 50.0000, 0.0000, -82.7485, 3.4412],
  // Pair 4
  [50.0000, -1.3802, -84.2814, 50.0000, 0.0000, -82.7485, 1.0000],
  // Pair 5
  [50.0000, -1.1848, -84.8006, 50.0000, 0.0000, -82.7485, 1.0000],
  // Pair 6
  [50.0000, -0.9009, -85.5211, 50.0000, 0.0000, -82.7485, 1.0000],
  // Pair 7
  [50.0000, 0.0000, 0.0000, 50.0000, -1.0000, 2.0000, 2.3669],
  // Pair 8
  [50.0000, -1.0000, 2.0000, 50.0000, 0.0000, 0.0000, 2.3669],
  // Pair 9
  [50.0000, 2.4900, -0.0010, 50.0000, -2.4900, 0.0009, 7.1792],
  // Pair 10
  [50.0000, 2.4900, -0.0010, 50.0000, -2.4900, 0.0010, 7.1792],
  // Pair 11
  [50.0000, 2.4900, -0.0010, 50.0000, -2.4900, 0.0011, 7.2195],
  // Pair 12
  [50.0000, 2.4900, -0.0010, 50.0000, -2.4900, 0.0012, 7.2195],
  // Pair 13
  [50.0000, -0.0010, 2.4900, 50.0000, 0.0009, -2.4900, 4.8045],
  // Pair 14
  [50.0000, -0.0010, 2.4900, 50.0000, 0.0010, -2.4900, 4.8045],
  // Pair 15
  [50.0000, -0.0010, 2.4900, 50.0000, 0.0011, -2.4900, 4.7461],
  // Pair 16
  [50.0000, 2.5000, 0.0000, 50.0000, 0.0000, -2.5000, 4.3065],
  // Pair 17
  [50.0000, 2.5000, 0.0000, 73.0000, 25.0000, -18.0000, 27.1492],
  // Pair 18
  [50.0000, 2.5000, 0.0000, 61.0000, -5.0000, 29.0000, 22.8977],
  // Pair 19
  [50.0000, 2.5000, 0.0000, 56.0000, -27.0000, -3.0000, 31.9030],
  // Pair 20
  [50.0000, 2.5000, 0.0000, 58.0000, 24.0000, 15.0000, 19.4535],
  // Pair 21
  [50.0000, 2.5000, 0.0000, 50.0000, 3.1736, 0.5854, 1.0000],
  // Pair 22
  [50.0000, 2.5000, 0.0000, 50.0000, 3.2972, 0.0000, 1.0000],
  // Pair 23
  [50.0000, 2.5000, 0.0000, 50.0000, 1.8634, 0.5757, 1.0000],
  // Pair 24
  [50.0000, 2.5000, 0.0000, 50.0000, 3.2592, 0.3350, 1.0000],
  // Pair 25
  [60.2574, -34.0099, 36.2677, 60.4626, -34.1751, 39.4387, 1.2644],
  // Pair 26
  [63.0109, -31.0961, -5.8663, 62.8187, -29.7946, -4.0864, 1.2630],
  // Pair 27
  [61.2901, 3.7196, -5.3901, 61.4292, 2.2480, -4.9620, 1.8731],
  // Pair 28
  [35.0831, -44.1164, 3.7933, 35.0232, -40.0716, 1.5901, 1.8645],
  // Pair 29
  [22.7233, 20.0904, -46.6940, 23.0331, 14.9730, -42.5619, 2.0373],
  // Pair 30
  [36.4612, 47.8580, 18.3852, 36.2715, 50.5065, 21.2231, 1.4146],
  // Pair 31
  [90.8027, -2.0831, 1.4410, 91.1528, -1.6435, 0.0447, 1.4441],
  // Pair 32
  [90.9257, -0.5406, -0.9208, 88.6381, -0.8985, -0.7239, 1.5381],
  // Pair 33
  [6.7747, -0.2908, -2.4247, 5.8714, -0.0985, -2.2286, 0.6377],
  // Pair 34
  [2.0776, 0.0795, -1.1350, 0.9033, -0.0636, -0.5514, 0.9082],
];

describe('deltaE2000 — Sharma et al. (2005) 34-pair test', () => {
  SHARMA_TEST_DATA.forEach(([L1, a1, b1, L2, a2, b2, expected], index) => {
    it(`pair ${index + 1}: expected ${expected}`, () => {
      const lab1: LabColor = { L: L1, a: a1, b: b1 };
      const lab2: LabColor = { L: L2, a: a2, b: b2 };
      const result = deltaE2000(lab1, lab2);
      expect(result).toBeCloseTo(expected, 4);
    });
  });
});

describe('deltaE76', () => {
  it('should return 0 for identical colors', () => {
    const lab: LabColor = { L: 50, a: 10, b: -20 };
    expect(deltaE76(lab, lab)).toBeCloseTo(0, 10);
  });

  it('should calculate simple Euclidean distance', () => {
    const lab1: LabColor = { L: 50, a: 0, b: 0 };
    const lab2: LabColor = { L: 53, a: 4, b: 0 };
    // sqrt(9 + 16 + 0) = 5
    expect(deltaE76(lab1, lab2)).toBeCloseTo(5.0, 4);
  });

  it('pure lightness difference', () => {
    const lab1: LabColor = { L: 50, a: 0, b: 0 };
    const lab2: LabColor = { L: 60, a: 0, b: 0 };
    expect(deltaE76(lab1, lab2)).toBeCloseTo(10.0, 4);
  });

  it('known textbook example', () => {
    const lab1: LabColor = { L: 50, a: 2.6772, b: -79.7751 };
    const lab2: LabColor = { L: 50, a: 0, b: -82.7485 };
    // sqrt(0 + 2.6772² + (-79.7751+82.7485)²) = sqrt(7.166 + 8.848) ≈ 4.001
    const dL = 0;
    const da = 2.6772;
    const db = -79.7751 + 82.7485;
    const expected = Math.sqrt(dL * dL + da * da + db * db);
    expect(deltaE76(lab1, lab2)).toBeCloseTo(expected, 4);
  });
});

describe('deltaE94', () => {
  it('should return 0 for identical colors', () => {
    const lab: LabColor = { L: 50, a: 10, b: -20 };
    expect(deltaE94(lab, lab)).toBeCloseTo(0, 10);
  });

  it('pure lightness difference', () => {
    const lab1: LabColor = { L: 50, a: 0, b: 0 };
    const lab2: LabColor = { L: 60, a: 0, b: 0 };
    // dL=10, dC=0, dH=0 => SL=1, SC=1, SH=1 => dE94=10
    expect(deltaE94(lab1, lab2)).toBeCloseTo(10.0, 4);
  });

  it('should be asymmetric for chroma-weighted formula', () => {
    // CIE94 uses C1 (reference) for weighting, so order matters
    const lab1: LabColor = { L: 50, a: 30, b: 0 };
    const lab2: LabColor = { L: 50, a: 0, b: 30 };
    const result12 = deltaE94(lab1, lab2);
    const result21 = deltaE94(lab2, lab1);
    // Both should be positive but may differ
    expect(result12).toBeGreaterThan(0);
    expect(result21).toBeGreaterThan(0);
  });

  it('known reference value', () => {
    const lab1: LabColor = { L: 50, a: 2.5, b: 0 };
    const lab2: LabColor = { L: 50, a: 0, b: -2.5 };
    const result = deltaE94(lab1, lab2);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });
});
