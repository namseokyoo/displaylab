/**
 * Wavelength Shift Operations
 *
 * Handles shifting spectrum data along the wavelength axis.
 */

import type { SpectrumData, SpectrumPoint } from '@/types';

/**
 * Shift spectrum data by a specified amount in nm.
 */
export function shiftSpectrum(spectrum: SpectrumPoint[], shiftNm: number): SpectrumPoint[] {
  return spectrum.map((point) => ({
    wavelength: point.wavelength + shiftNm,
    intensity: point.intensity,
  }));
}

/**
 * Shift spectrum data while clamping to visible range (380-780nm).
 * Points outside the range will have zero intensity.
 */
export function shiftSpectrumClamped(
  spectrum: SpectrumPoint[],
  shiftNm: number,
  minWavelength: number = 380,
  maxWavelength: number = 780,
): SpectrumPoint[] {
  return spectrum.map((point) => {
    const newWavelength = point.wavelength + shiftNm;
    const isInRange = newWavelength >= minWavelength && newWavelength <= maxWavelength;

    return {
      wavelength: newWavelength,
      intensity: isInRange ? point.intensity : 0,
    };
  });
}

/**
 * Get the peak wavelength of a spectrum.
 */
export function getPeakWavelength(spectrum: SpectrumPoint[]): number {
  if (spectrum.length === 0) {
    return 0;
  }

  let maxIntensity = -Infinity;
  let peakWavelength = spectrum[0].wavelength;

  for (const point of spectrum) {
    if (point.intensity > maxIntensity) {
      maxIntensity = point.intensity;
      peakWavelength = point.wavelength;
    }
  }

  return peakWavelength;
}

/**
 * Calculate the full width at half maximum (FWHM) of a spectrum.
 */
export function getFWHM(spectrum: SpectrumPoint[]): number {
  if (spectrum.length < 3) {
    return 0;
  }

  const peak = Math.max(...spectrum.map((p) => p.intensity));
  const halfMax = peak / 2;

  const sorted = [...spectrum].sort((a, b) => a.wavelength - b.wavelength);

  let leftWavelength = sorted[0].wavelength;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].intensity < halfMax && sorted[i + 1].intensity >= halfMax) {
      const t =
        (halfMax - sorted[i].intensity) / (sorted[i + 1].intensity - sorted[i].intensity);
      leftWavelength = sorted[i].wavelength + t * (sorted[i + 1].wavelength - sorted[i].wavelength);
      break;
    }
  }

  let rightWavelength = sorted[sorted.length - 1].wavelength;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (sorted[i].intensity < halfMax && sorted[i - 1].intensity >= halfMax) {
      const t =
        (halfMax - sorted[i].intensity) / (sorted[i - 1].intensity - sorted[i].intensity);
      rightWavelength = sorted[i].wavelength + t * (sorted[i - 1].wavelength - sorted[i].wavelength);
      break;
    }
  }

  return rightWavelength - leftWavelength;
}

/**
 * Create SpectrumData from an array of points.
 */
export function createSpectrumData(points: SpectrumPoint[]): SpectrumData {
  if (points.length === 0) {
    return {
      points: [],
      minWavelength: 0,
      maxWavelength: 0,
      peakWavelength: 0,
    };
  }

  const wavelengths = points.map((p) => p.wavelength);

  return {
    points,
    minWavelength: Math.min(...wavelengths),
    maxWavelength: Math.max(...wavelengths),
    peakWavelength: getPeakWavelength(points),
  };
}
