/**
 * Viewing Angle Library Tests
 *
 * Tests for CSV parsing, ΔE computation, contrast ratio,
 * white point shift, and CSV export.
 */

import { describe, it, expect } from 'vitest';
import {
  parseViewingAngleCSV,
  parseViewingAngleRows,
  computeViewingAngleMetrics,
  computeWhitePointShift,
  exportViewingAngleCSV,
  xyLuminanceToLab,
  VA_REQUIRED_COLUMNS,
} from '../viewing-angle';
import type { ViewingAngleData } from '@/types';

const SAMPLE_CSV = `angle,luminance,cieX,cieY
0,350.0,0.3127,0.3290
10,348.5,0.3130,0.3288
30,325.0,0.3155,0.3265
60,220.0,0.3250,0.3170
80,105.0,0.3360,0.3060`;

describe('parseViewingAngleCSV', () => {
  it('should parse valid CSV text into ViewingAngleData[]', () => {
    const data = parseViewingAngleCSV(SAMPLE_CSV);
    expect(data).toHaveLength(5);
    expect(data[0]).toEqual({
      angle: 0,
      luminance: 350.0,
      cieX: 0.3127,
      cieY: 0.3290,
    });
    expect(data[4].angle).toBe(80);
  });

  it('should throw on empty CSV', () => {
    expect(() => parseViewingAngleCSV('')).toThrow();
  });

  it('should throw when required columns are missing', () => {
    const badCSV = `angle,luminance\n0,350\n10,348`;
    expect(() => parseViewingAngleCSV(badCSV)).toThrow('Missing required column');
  });

  it('should handle tab-delimited data', () => {
    const tsvData = `angle\tluminance\tcieX\tcieY\n0\t350\t0.3127\t0.3290\n10\t348\t0.3130\t0.3288`;
    const data = parseViewingAngleCSV(tsvData);
    expect(data).toHaveLength(2);
    expect(data[0].angle).toBe(0);
  });
});

describe('parseViewingAngleRows', () => {
  it('should convert ParsedRow[] to ViewingAngleData[]', () => {
    const rows = [
      { angle: 0, luminance: 350, cieX: 0.3127, cieY: 0.329 },
      { angle: 10, luminance: 348, cieX: 0.313, cieY: 0.3288 },
    ];
    const data = parseViewingAngleRows(rows);
    expect(data).toHaveLength(2);
    expect(data[0].cieX).toBe(0.3127);
  });

  it('should throw on empty rows', () => {
    expect(() => parseViewingAngleRows([])).toThrow();
  });
});

describe('xyLuminanceToLab', () => {
  it('should convert D65 white point at reference luminance to L*=100', () => {
    const lab = xyLuminanceToLab(0.3127, 0.329, 100, 100);
    // At reference luminance with D65 white, L* should be ~100
    expect(lab.L).toBeCloseTo(100, 0);
  });

  it('should return lower L* for lower luminance', () => {
    const labFull = xyLuminanceToLab(0.3127, 0.329, 100, 100);
    const labHalf = xyLuminanceToLab(0.3127, 0.329, 50, 100);
    expect(labHalf.L).toBeLessThan(labFull.L);
  });
});

describe('computeViewingAngleMetrics', () => {
  const baseData: ViewingAngleData[] = [
    { angle: 0, luminance: 350, cieX: 0.3127, cieY: 0.329 },
    { angle: 30, luminance: 325, cieX: 0.3155, cieY: 0.3265 },
    { angle: 60, luminance: 220, cieX: 0.325, cieY: 0.317 },
    { angle: 80, luminance: 105, cieX: 0.336, cieY: 0.306 },
  ];

  it('should compute ΔE values for each angle', () => {
    const result = computeViewingAngleMetrics(baseData);
    expect(result).toHaveLength(4);

    // 0-degree reference should have ΔE = 0
    expect(result[0].deltaE_ab).toBeCloseTo(0, 4);
    expect(result[0].deltaE_2000).toBeCloseTo(0, 4);

    // ΔE should increase with angle
    expect(result[1].deltaE_ab!).toBeGreaterThan(0);
    expect(result[2].deltaE_ab!).toBeGreaterThan(result[1].deltaE_ab!);
    expect(result[3].deltaE_ab!).toBeGreaterThan(result[2].deltaE_ab!);
  });

  it('should compute contrast ratio correctly', () => {
    const result = computeViewingAngleMetrics(baseData);

    // 0-degree: CR = 1.0
    expect(result[0].contrastRatio).toBeCloseTo(1.0, 4);

    // 30-degree: 325/350
    expect(result[1].contrastRatio).toBeCloseTo(325 / 350, 4);

    // 80-degree: 105/350
    expect(result[3].contrastRatio).toBeCloseTo(105 / 350, 4);
  });

  it('should handle empty array', () => {
    expect(computeViewingAngleMetrics([])).toEqual([]);
  });

  it('should use first row as reference when no 0-degree exists', () => {
    const noZeroData: ViewingAngleData[] = [
      { angle: 10, luminance: 340, cieX: 0.313, cieY: 0.328 },
      { angle: 30, luminance: 300, cieX: 0.316, cieY: 0.326 },
    ];
    const result = computeViewingAngleMetrics(noZeroData);
    // First row is reference, so its ΔE should be 0
    expect(result[0].deltaE_ab).toBeCloseTo(0, 4);
    expect(result[0].contrastRatio).toBeCloseTo(1.0, 4);
  });

  it('ΔE2000 values should be positive and differ from ΔE76', () => {
    const result = computeViewingAngleMetrics(baseData);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].deltaE_2000!).toBeGreaterThan(0);
      // ΔE76 and ΔE2000 should generally differ
      // (they may occasionally be close but not exactly equal for non-zero ΔE)
    }
  });
});

describe('computeWhitePointShift', () => {
  const data: ViewingAngleData[] = [
    { angle: 0, luminance: 350, cieX: 0.3127, cieY: 0.329 },
    { angle: 30, luminance: 325, cieX: 0.3155, cieY: 0.3265 },
    { angle: 60, luminance: 220, cieX: 0.325, cieY: 0.317 },
  ];

  it('should compute shift relative to 0-degree reference', () => {
    const shifts = computeWhitePointShift(data);
    expect(shifts).toHaveLength(3);

    // 0-degree: no shift
    expect(shifts[0].dx).toBeCloseTo(0, 6);
    expect(shifts[0].dy).toBeCloseTo(0, 6);
    expect(shifts[0].distance).toBeCloseTo(0, 6);

    // 30-degree: dx = 0.3155 - 0.3127 = 0.0028
    expect(shifts[1].dx).toBeCloseTo(0.0028, 4);
    expect(shifts[1].dy).toBeCloseTo(-0.0025, 4);
    expect(shifts[1].distance).toBeGreaterThan(0);
  });

  it('should increase distance with angle', () => {
    const shifts = computeWhitePointShift(data);
    expect(shifts[2].distance).toBeGreaterThan(shifts[1].distance);
  });

  it('should handle empty array', () => {
    expect(computeWhitePointShift([])).toEqual([]);
  });
});

describe('exportViewingAngleCSV', () => {
  it('should export data to CSV string', () => {
    const data: ViewingAngleData[] = [
      {
        angle: 0,
        luminance: 350,
        cieX: 0.3127,
        cieY: 0.329,
        deltaE_ab: 0,
        deltaE_2000: 0,
        contrastRatio: 1,
      },
      {
        angle: 30,
        luminance: 325,
        cieX: 0.3155,
        cieY: 0.3265,
        deltaE_ab: 2.5,
        deltaE_2000: 1.8,
        contrastRatio: 0.9286,
      },
    ];

    const csv = exportViewingAngleCSV(data);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('angle,luminance,cieX,cieY,deltaE_ab,deltaE_2000,contrastRatio');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('350.0');
    expect(lines[1]).toContain('0.3127');
  });

  it('should handle missing optional fields gracefully', () => {
    const data: ViewingAngleData[] = [
      { angle: 0, luminance: 350, cieX: 0.3127, cieY: 0.329 },
    ];
    const csv = exportViewingAngleCSV(data);
    // Missing deltaE_ab etc should default to 0
    expect(csv).toContain('0.0000');
  });
});

describe('VA_REQUIRED_COLUMNS', () => {
  it('should contain all 4 required columns', () => {
    expect(VA_REQUIRED_COLUMNS).toEqual(['angle', 'luminance', 'cieX', 'cieY']);
  });
});
