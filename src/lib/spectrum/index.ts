/**
 * Spectrum library exports for Display Lab.
 */

// Core algorithms
export { spectrumToXYZ, monochromaticToXYZ } from './spectrum-to-xyz';

// Spectrum operations
export {
  shiftSpectrum,
  shiftSpectrumClamped,
  getPeakWavelength,
  getFWHM,
  createSpectrumData,
} from './wavelength-shift';

// Spectrum analysis
export { analyzeSpectrum, type SpectrumAnalysis } from './spectrum-analysis';

// Data processing
export { normalizeSpectrum, normalizeToRange, baselineCorrection, smoothSpectrum } from './normalize';
export {
  interpolateSpectrum,
  interpolateToVisibleRange,
  resampleSpectrum,
  extendToVisibleRange,
} from './spectrum-interpolate';

// Parsers
export { parseSpectrumText, parseSpectrumFile, validateSpectrumData } from './file-parser';
export {
  parseClipboardData,
  parseAndValidateClipboard,
  isSpectrumData,
  getExampleFormat,
  createSampleData,
} from './clipboard-parser';

// Presets
export {
  PRESETS,
  PRESET_BLUE,
  PRESET_GREEN,
  PRESET_RED,
  PRESET_WHITE,
  getPreset,
  generateGaussianSpectrum,
  generateMonochromatic,
  type PresetKey,
} from './presets';

import { xyzToXY, xyzToUV } from '@/lib/cie';
import { calculateCCT, calculateDuv } from '@/lib/cct';
import { xyzToHex } from '@/lib/color-convert';
import type { ChromaticityResult, SpectrumPoint } from '@/types';
import { spectrumToXYZ } from './spectrum-to-xyz';
import { getPeakWavelength } from './wavelength-shift';

export type SpectrumChromaticityResult = ChromaticityResult & {
  cct: number;
  duv: number;
};

/**
 * Calculate chromaticity and related metrics from spectrum data.
 */
export function calculateChromaticity(spectrum: SpectrumPoint[]): SpectrumChromaticityResult {
  const xyz = spectrumToXYZ(spectrum);
  const cie1931 = xyzToXY(xyz);
  const cie1976 = xyzToUV(xyz);
  const hexColor = xyzToHex(xyz);
  const dominantWavelength = getPeakWavelength(spectrum);
  const cct = calculateCCT(cie1931.x, cie1931.y);
  const duv = calculateDuv(cie1931.x, cie1931.y);

  return {
    xyz,
    cie1931,
    cie1976,
    dominantWavelength,
    hexColor,
    cct,
    duv,
  };
}
