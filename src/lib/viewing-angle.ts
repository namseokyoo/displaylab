/**
 * Viewing Angle Analysis Library
 *
 * Parses CSV data into ViewingAngleData[] and computes:
 * - Delta E*ab (CIE76) and CIEDE2000 vs 0-degree reference
 * - Contrast ratio (luminance at angle / luminance at 0 degree)
 * - White point shift analysis
 *
 * Reuses: csv-parser.ts, delta-e.ts, color-convert.ts (xyYToXYZ, xyzToLab)
 */

import type { ViewingAngleData, LabColor } from '@/types';
import type { ParsedRow } from '@/lib/csv-parser';
import { parseCSVText, validateCSVData } from '@/lib/csv-parser';
import { deltaE76, deltaE2000 } from '@/lib/delta-e';
import { xyYToXYZ, xyzToLab } from '@/lib/color-convert';

/** Required columns for viewing angle CSV */
export const VA_REQUIRED_COLUMNS = ['angle', 'luminance', 'cieX', 'cieY'];

/**
 * Convert CIE xy + luminance to Lab colour.
 *
 * The luminance (cd/m^2) is used as the Y tristimulus value.
 * We normalise to Y=100 scale for Lab conversion by treating
 * the reference luminance as 100.
 */
export function xyLuminanceToLab(
  cieX: number,
  cieY: number,
  luminance: number,
  referenceLuminance: number,
): LabColor {
  // Normalise Y to 0-100 scale relative to reference
  const yNorm = referenceLuminance > 0 ? (luminance / referenceLuminance) * 100 : 0;
  const xyz = xyYToXYZ(cieX, cieY, yNorm);
  return xyzToLab(xyz);
}

/**
 * Parse CSV rows into ViewingAngleData[].
 * Validates that required columns exist.
 */
export function parseViewingAngleRows(rows: ParsedRow[]): ViewingAngleData[] {
  const validation = validateCSVData(rows, VA_REQUIRED_COLUMNS);
  if (!validation.valid) {
    throw new Error(`Invalid CSV data: ${validation.errors.join(', ')}`);
  }

  return rows.map((row) => ({
    angle: row.angle,
    luminance: row.luminance,
    cieX: row.cieX,
    cieY: row.cieY,
  }));
}

/**
 * Parse CSV text content into ViewingAngleData[].
 *
 * Uses a two-pass approach: first tries parseCSVText with expectedColumns,
 * and if that returns empty (e.g. header-based CSV where delimiter detection
 * fails on non-numeric headers), falls back to manual comma-based parsing
 * with explicit header extraction.
 */
export function parseViewingAngleCSV(csvText: string): ViewingAngleData[] {
  // First attempt: use the generic parser
  let rows = parseCSVText(csvText, VA_REQUIRED_COLUMNS);

  // Fallback: if generic parser returned nothing, parse comma CSV manually
  if (rows.length === 0) {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== '' && !l.startsWith('#') && !l.startsWith('//'));

    if (lines.length < 2) {
      return parseViewingAngleRows([]); // will throw
    }

    // Detect comma delimiter in header
    const headerLine = lines[0];
    const delimiter = headerLine.includes(',') ? ',' : headerLine.includes('\t') ? '\t' : ',';
    const headers = headerLine.split(delimiter).map((h) => h.trim());

    rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map((p) => p.trim());
      const values = parts.map((p) => parseFloat(p));
      if (values.some((v) => isNaN(v))) continue;

      const row: ParsedRow = {};
      values.forEach((v, idx) => {
        if (idx < headers.length) {
          row[headers[idx]] = v;
        }
      });
      rows.push(row);
    }
  }

  return parseViewingAngleRows(rows);
}

/**
 * Compute ΔE and contrast ratio for each angle relative to the 0-degree reference.
 *
 * If no 0-degree measurement exists, uses the first row as reference.
 * Returns a new array with deltaE_ab, deltaE_2000, and contrastRatio filled in.
 */
export function computeViewingAngleMetrics(
  data: ViewingAngleData[],
): ViewingAngleData[] {
  if (data.length === 0) return [];

  // Find 0-degree reference (or use first row)
  const ref = data.find((d) => d.angle === 0) ?? data[0];
  const refLab = xyLuminanceToLab(ref.cieX, ref.cieY, ref.luminance, ref.luminance);
  const refLuminance = ref.luminance;

  return data.map((d) => {
    const lab = xyLuminanceToLab(d.cieX, d.cieY, d.luminance, refLuminance);

    return {
      ...d,
      deltaE_ab: deltaE76(refLab, lab),
      deltaE_2000: deltaE2000(refLab, lab),
      contrastRatio: refLuminance > 0 ? d.luminance / refLuminance : 0,
    };
  });
}

/**
 * White point shift analysis.
 *
 * Returns the D65 reference point and how far each angle's chromaticity has shifted
 * from the 0-degree measurement.
 */
export interface WhitePointShift {
  angle: number;
  dx: number; // shift in CIE x
  dy: number; // shift in CIE y
  distance: number; // Euclidean distance in xy space
}

export function computeWhitePointShift(
  data: ViewingAngleData[],
): WhitePointShift[] {
  if (data.length === 0) return [];

  const ref = data.find((d) => d.angle === 0) ?? data[0];

  return data.map((d) => {
    const dx = d.cieX - ref.cieX;
    const dy = d.cieY - ref.cieY;
    return {
      angle: d.angle,
      dx,
      dy,
      distance: Math.sqrt(dx * dx + dy * dy),
    };
  });
}

/**
 * Export viewing angle data to CSV string (for download).
 */
export function exportViewingAngleCSV(data: ViewingAngleData[]): string {
  const headers = ['angle', 'luminance', 'cieX', 'cieY', 'deltaE_ab', 'deltaE_2000', 'contrastRatio'];
  const lines = [headers.join(',')];

  for (const d of data) {
    lines.push(
      [
        d.angle,
        d.luminance.toFixed(1),
        d.cieX.toFixed(4),
        d.cieY.toFixed(4),
        (d.deltaE_ab ?? 0).toFixed(4),
        (d.deltaE_2000 ?? 0).toFixed(4),
        (d.contrastRatio ?? 0).toFixed(4),
      ].join(','),
    );
  }

  return lines.join('\n');
}
