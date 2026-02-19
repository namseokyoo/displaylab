/**
 * CCT and Duv Calculation Tests
 *
 * Verified against CIE standard illuminant data and McCamy's formula.
 */

import { describe, it, expect } from 'vitest';
import { calculateCCT, calculateDuv, calculateCCTAndDuv, interpretCCT } from '../cct';

describe('calculateCCT (McCamy approximation)', () => {
  it('D65: should return ~6504K', () => {
    const cct = calculateCCT(0.3127, 0.3290);
    // McCamy's for D65 should be close to 6504K (±50K tolerance)
    expect(cct).toBeGreaterThan(6450);
    expect(cct).toBeLessThan(6550);
  });

  it('Illuminant A: should return ~2856K', () => {
    const cct = calculateCCT(0.4476, 0.4074);
    // McCamy's for illuminant A, should be close to 2856K (±50K)
    expect(cct).toBeGreaterThan(2800);
    expect(cct).toBeLessThan(2910);
  });

  it('D50: should return ~5003K', () => {
    const cct = calculateCCT(0.3457, 0.3585);
    expect(cct).toBeGreaterThan(4950);
    expect(cct).toBeLessThan(5100);
  });

  it('Illuminant C: should return ~6774K', () => {
    const cct = calculateCCT(0.3101, 0.3162);
    expect(cct).toBeGreaterThan(6700);
    expect(cct).toBeLessThan(6850);
  });

  it('warm color temperature (3000K region)', () => {
    // Approximate xy for 3000K on Planckian locus
    const cct = calculateCCT(0.4369, 0.4041);
    expect(cct).toBeGreaterThan(2900);
    expect(cct).toBeLessThan(3100);
  });
});

describe('calculateDuv', () => {
  it('D65: Duv should be near 0 (on Planckian locus)', () => {
    const duv = calculateDuv(0.3127, 0.3290);
    expect(Math.abs(duv)).toBeLessThan(0.01);
  });

  it('Illuminant A: Duv should be near 0', () => {
    const duv = calculateDuv(0.4476, 0.4074);
    expect(Math.abs(duv)).toBeLessThan(0.01);
  });

  it('off-locus point should have non-zero Duv', () => {
    // A point shifted from D65 — Duv magnitude should be significant
    const duv = calculateDuv(0.3127, 0.3600);
    expect(Math.abs(duv)).toBeGreaterThan(0.005);
  });

  it('D50: Duv should be near 0', () => {
    const duv = calculateDuv(0.3457, 0.3585);
    expect(Math.abs(duv)).toBeLessThan(0.01);
  });
});

describe('calculateCCTAndDuv', () => {
  it('should return both CCT and Duv', () => {
    const result = calculateCCTAndDuv(0.3127, 0.3290);
    expect(result).toHaveProperty('cct');
    expect(result).toHaveProperty('duv');
    expect(result.cct).toBeGreaterThan(6400);
    expect(Math.abs(result.duv)).toBeLessThan(0.01);
  });
});

describe('interpretCCT', () => {
  it('warm: < 3500K', () => {
    const result = interpretCCT(2700);
    expect(result.category).toBe('warm');
  });

  it('neutral: 3500-5500K', () => {
    const result = interpretCCT(4000);
    expect(result.category).toBe('neutral');
  });

  it('cool: > 5500K', () => {
    const result = interpretCCT(6500);
    expect(result.category).toBe('cool');
  });

  it('boundary at 3500K is neutral', () => {
    expect(interpretCCT(3500).category).toBe('neutral');
  });

  it('boundary at 5500K is neutral', () => {
    expect(interpretCCT(5500).category).toBe('neutral');
  });
});
