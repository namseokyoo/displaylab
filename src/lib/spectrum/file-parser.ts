/**
 * File Parser
 *
 * Parse CSV and TXT files containing spectrum data.
 */

import type { SpectrumPoint } from '@/types';

/** Detect delimiter in a line of text. */
function detectDelimiter(line: string): string {
  const delimiters = ['\t', ',', ';', ' '];

  for (const delimiter of delimiters) {
    const parts = line.split(delimiter).filter((p) => p.trim() !== '');
    if (parts.length >= 2) {
      const hasNumbers = parts.slice(0, 2).every((p) => !Number.isNaN(parseFloat(p.trim())));
      if (hasNumbers) {
        return delimiter;
      }
    }
  }

  return '\t';
}

/** Check if a line is a header (contains non-numeric values). */
function isHeaderLine(line: string, delimiter: string): boolean {
  const parts = line.split(delimiter).filter((p) => p.trim() !== '');

  if (parts.length < 2) {
    return true;
  }

  return parts.slice(0, 2).some((p) => {
    const trimmed = p.trim();
    return Number.isNaN(parseFloat(trimmed)) && trimmed !== '';
  });
}

/** Parse a single line of spectrum data. */
function parseDataLine(line: string, delimiter: string): SpectrumPoint | null {
  const parts = line.split(delimiter).filter((p) => p.trim() !== '');

  if (parts.length < 2) {
    return null;
  }

  const wavelength = parseFloat(parts[0].trim());
  const intensity = parseFloat(parts[1].trim());

  if (Number.isNaN(wavelength) || Number.isNaN(intensity)) {
    return null;
  }

  return { wavelength, intensity };
}

/**
 * Parse spectrum data from text content.
 */
export function parseSpectrumText(content: string): SpectrumPoint[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  if (lines.length === 0) {
    return [];
  }

  const delimiter = detectDelimiter(lines[0]);

  const points: SpectrumPoint[] = [];
  let headerSkipped = false;

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    if (!headerSkipped && isHeaderLine(line, delimiter)) {
      headerSkipped = true;
      continue;
    }

    const point = parseDataLine(line, delimiter);
    if (point) {
      points.push(point);
    }
  }

  return points;
}

/**
 * Parse spectrum data from a File object.
 */
export async function parseSpectrumFile(file: File): Promise<SpectrumPoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        try {
          const points = parseSpectrumText(content);
          resolve(points);
        } catch (error) {
          console.error('Failed to parse spectrum file content', error);
          reject(new Error(`Failed to parse file: ${String(error)}`));
        }
      } else {
        reject(new Error('Failed to read file content'));
      }
    };

    reader.onerror = () => {
      const err = new Error('Failed to read file');
      console.error('Failed to read spectrum file', err);
      reject(err);
    };

    reader.readAsText(file);
  });
}

/**
 * Validate spectrum data.
 */
export function validateSpectrumData(points: SpectrumPoint[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (points.length === 0) {
    errors.push('No data points found');
    return { valid: false, errors, warnings };
  }

  if (points.length < 3) {
    warnings.push('Very few data points - results may be inaccurate');
  }

  const wavelengths = points.map((p) => p.wavelength);
  const minWl = Math.min(...wavelengths);
  const maxWl = Math.max(...wavelengths);

  if (minWl < 300 || maxWl > 900) {
    warnings.push('Wavelength range extends beyond typical visible spectrum (380-780nm)');
  }

  if (maxWl - minWl < 10) {
    warnings.push('Wavelength range is very narrow');
  }

  const hasNegative = points.some((p) => p.intensity < 0);
  if (hasNegative) {
    warnings.push('Negative intensity values detected - will be treated as zero');
  }

  const uniqueWavelengths = new Set(wavelengths);
  if (uniqueWavelengths.size !== wavelengths.length) {
    warnings.push('Duplicate wavelength values detected - using first occurrence');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
