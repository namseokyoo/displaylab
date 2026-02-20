/**
 * Spectrum Analysis Utilities
 *
 * Provides analysis functions for emission spectrum data including
 * peak detection and width measurements (FWHM, FWQM)
 */

import type { SpectrumPoint } from '@/types';

export interface SpectrumAnalysis {
  peakWavelength: number;
  peakIntensity: number;
  fwhm: number | null;
  fwhmRange: [number, number] | null;
  fwqm: number | null;
  fwqmRange: [number, number] | null;
}

/**
 * Analyze spectrum data to extract peak and width measurements.
 */
export function analyzeSpectrum(spectrum: SpectrumPoint[], shiftNm: number = 0): SpectrumAnalysis {
  if (!spectrum || spectrum.length === 0) {
    return {
      peakWavelength: 0,
      peakIntensity: 0,
      fwhm: null,
      fwhmRange: null,
      fwqm: null,
      fwqmRange: null,
    };
  }

  const sorted = [...spectrum].sort((a, b) => a.wavelength - b.wavelength);

  let peakIdx = 0;
  let peakIntensity = -Infinity;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].intensity > peakIntensity) {
      peakIntensity = sorted[i].intensity;
      peakIdx = i;
    }
  }

  const peakWavelength = sorted[peakIdx].wavelength + shiftNm;

  const halfMax = peakIntensity / 2;
  const fwhmRange = findWidthAtLevel(sorted, peakIdx, halfMax, shiftNm);
  const fwhm = fwhmRange ? fwhmRange[1] - fwhmRange[0] : null;

  const quarterMax = peakIntensity / 4;
  const fwqmRange = findWidthAtLevel(sorted, peakIdx, quarterMax, shiftNm);
  const fwqm = fwqmRange ? fwqmRange[1] - fwqmRange[0] : null;

  return {
    peakWavelength,
    peakIntensity,
    fwhm,
    fwhmRange,
    fwqm,
    fwqmRange,
  };
}

function findWidthAtLevel(
  spectrum: SpectrumPoint[],
  peakIdx: number,
  level: number,
  shiftNm: number,
): [number, number] | null {
  let leftWl: number | null = null;
  for (let i = peakIdx; i > 0; i--) {
    if (spectrum[i].intensity >= level && spectrum[i - 1].intensity < level) {
      const t =
        (level - spectrum[i - 1].intensity) / (spectrum[i].intensity - spectrum[i - 1].intensity);
      leftWl =
        spectrum[i - 1].wavelength +
        t * (spectrum[i].wavelength - spectrum[i - 1].wavelength) +
        shiftNm;
      break;
    }
  }

  let rightWl: number | null = null;
  for (let i = peakIdx; i < spectrum.length - 1; i++) {
    if (spectrum[i].intensity >= level && spectrum[i + 1].intensity < level) {
      const t =
        (level - spectrum[i].intensity) / (spectrum[i + 1].intensity - spectrum[i].intensity);
      rightWl = spectrum[i].wavelength + t * (spectrum[i + 1].wavelength - spectrum[i].wavelength) + shiftNm;
      break;
    }
  }

  if (leftWl !== null && rightWl !== null) {
    return [leftWl, rightWl];
  }

  return null;
}
