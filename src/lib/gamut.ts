/**
 * Color Gamut Calculations
 *
 * - Shoelace formula for triangle area
 * - Gamut coverage percentage (area ratio)
 * - CIE 1931 xy and CIE 1976 u'v' support
 */

import { xyToUV } from '@/lib/cie';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import type { GamutData, CIE1931Coordinates, CIE1976Coordinates, DiagramMode } from '@/types';

interface Point2D {
  x: number;
  y: number;
}

/**
 * Shoelace formula for triangle area
 * Area = 0.5 * |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)|
 */
export function triangleArea(p1: Point2D, p2: Point2D, p3: Point2D): number {
  return (
    0.5 *
    Math.abs(
      p1.x * (p2.y - p3.y) +
      p2.x * (p3.y - p1.y) +
      p3.x * (p1.y - p2.y)
    )
  );
}

/**
 * Convert GamutData primaries to array of CIE 1931 xy points
 */
function primariesToXYPoints(primaries: GamutData['primaries']): [CIE1931Coordinates, CIE1931Coordinates, CIE1931Coordinates] {
  return [primaries.red, primaries.green, primaries.blue];
}

/**
 * Convert CIE 1931 xy points to CIE 1976 u'v' points
 */
function xyPointsToUV(points: CIE1931Coordinates[]): CIE1976Coordinates[] {
  return points.map((p) => xyToUV(p));
}

/**
 * Calculate gamut area in CIE 1931 xy coordinates
 */
export function calculateGamutAreaXY(primaries: GamutData['primaries']): number {
  const [r, g, b] = primariesToXYPoints(primaries);
  return triangleArea(r, g, b);
}

/**
 * Calculate gamut area in CIE 1976 u'v' coordinates
 */
export function calculateGamutAreaUV(primaries: GamutData['primaries']): number {
  const xyPoints = primariesToXYPoints(primaries);
  const uvPoints = xyPointsToUV(xyPoints);
  return triangleArea(
    { x: uvPoints[0].u, y: uvPoints[0].v },
    { x: uvPoints[1].u, y: uvPoints[1].v },
    { x: uvPoints[2].u, y: uvPoints[2].v },
  );
}

/**
 * Calculate gamut area in specified coordinate system
 */
export function calculateGamutArea(
  primaries: GamutData['primaries'],
  mode: DiagramMode = 'CIE1931',
): number {
  if (mode === 'CIE1976') {
    return calculateGamutAreaUV(primaries);
  }
  return calculateGamutAreaXY(primaries);
}

/**
 * Calculate coverage percentage of custom gamut vs a standard gamut
 * Coverage = (custom area / standard area) * 100
 *
 * Note: This is a simple area ratio, not intersection-based.
 * Intersection-based coverage will be implemented in Phase 2.
 */
export function calculateCoverage(
  customPrimaries: GamutData['primaries'],
  standardPrimaries: GamutData['primaries'],
  mode: DiagramMode = 'CIE1931',
): number {
  const customArea = calculateGamutArea(customPrimaries, mode);
  const standardArea = calculateGamutArea(standardPrimaries, mode);

  if (standardArea === 0) return 0;
  return (customArea / standardArea) * 100;
}

/**
 * Coverage result for a single standard gamut
 */
export interface CoverageEntry {
  standardName: string;
  coverageXY: number;   // % in CIE 1931
  coverageUV: number;   // % in CIE 1976
  areaXY: number;       // standard area in CIE 1931
  areaUV: number;       // standard area in CIE 1976
}

/**
 * Calculate coverage against all standard gamuts
 */
export function calculateAllCoverages(
  customPrimaries: GamutData['primaries'],
): CoverageEntry[] {
  const customAreaXY = calculateGamutAreaXY(customPrimaries);
  const customAreaUV = calculateGamutAreaUV(customPrimaries);

  return Object.entries(STANDARD_GAMUTS).map(([, standard]) => {
    const stdAreaXY = calculateGamutAreaXY(standard.primaries);
    const stdAreaUV = calculateGamutAreaUV(standard.primaries);

    return {
      standardName: standard.name,
      coverageXY: stdAreaXY > 0 ? (customAreaXY / stdAreaXY) * 100 : 0,
      coverageUV: stdAreaUV > 0 ? (customAreaUV / stdAreaUV) * 100 : 0,
      areaXY: stdAreaXY,
      areaUV: stdAreaUV,
    };
  });
}

/**
 * Validate CIE xy coordinates (must be in 0-1 range)
 */
export function isValidCIExy(x: number, y: number): boolean {
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 && (x + y) <= 1;
}

/**
 * Validate all primaries in a GamutData
 */
export function areValidPrimaries(primaries: GamutData['primaries']): boolean {
  const { red, green, blue } = primaries;
  return (
    isValidCIExy(red.x, red.y) &&
    isValidCIExy(green.x, green.y) &&
    isValidCIExy(blue.x, blue.y)
  );
}
