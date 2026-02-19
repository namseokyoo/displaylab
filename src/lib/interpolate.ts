/**
 * Spectrum Data Interpolation
 *
 * Ported from ISCV interpolate.ts.
 */

import type { SpectrumPoint } from '@/types';

/** Linear interpolation between two values */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate spectrum to uniform wavelength intervals
 */
export function interpolateSpectrum(
  spectrum: SpectrumPoint[],
  step: number = 1,
  startWavelength?: number,
  endWavelength?: number,
): SpectrumPoint[] {
  if (spectrum.length === 0) return [];
  if (spectrum.length === 1) return [...spectrum];

  const sorted = [...spectrum].sort((a, b) => a.wavelength - b.wavelength);
  const start = startWavelength ?? sorted[0].wavelength;
  const end = endWavelength ?? sorted[sorted.length - 1].wavelength;
  const result: SpectrumPoint[] = [];

  for (let wavelength = start; wavelength <= end; wavelength += step) {
    let lowerIndex = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].wavelength <= wavelength && sorted[i + 1].wavelength >= wavelength) {
        lowerIndex = i;
        break;
      }
      if (sorted[i].wavelength > wavelength) break;
      lowerIndex = i;
    }

    const lower = sorted[lowerIndex];
    const upper = sorted[Math.min(lowerIndex + 1, sorted.length - 1)];

    if (wavelength <= lower.wavelength) {
      result.push({ wavelength, intensity: lower.intensity });
      continue;
    }

    if (wavelength >= upper.wavelength) {
      result.push({ wavelength, intensity: upper.intensity });
      continue;
    }

    const t = (wavelength - lower.wavelength) / (upper.wavelength - lower.wavelength);
    result.push({ wavelength, intensity: lerp(lower.intensity, upper.intensity, t) });
  }

  return result;
}

/**
 * Interpolate spectrum to standard visible range with 1nm steps
 */
export function interpolateToVisibleRange(spectrum: SpectrumPoint[]): SpectrumPoint[] {
  return interpolateSpectrum(spectrum, 1, 380, 780);
}
