/**
 * Standard Color Gamut Primaries
 *
 * CIE xy coordinates for standard display color gamuts.
 * Used by Gamut Analyzer for coverage calculation.
 */

import type { StandardGamut } from '@/types';

export const STANDARD_GAMUTS: Record<string, StandardGamut> = {
  sRGB: {
    name: 'sRGB',
    primaries: {
      red: { x: 0.64, y: 0.33 },
      green: { x: 0.30, y: 0.60 },
      blue: { x: 0.15, y: 0.06 },
    },
    whitePoint: { x: 0.3127, y: 0.3290 }, // D65
  },
  'DCI-P3': {
    name: 'DCI-P3',
    primaries: {
      red: { x: 0.680, y: 0.320 },
      green: { x: 0.265, y: 0.690 },
      blue: { x: 0.150, y: 0.060 },
    },
    whitePoint: { x: 0.3127, y: 0.3290 }, // D65
  },
  'BT.2020': {
    name: 'BT.2020',
    primaries: {
      red: { x: 0.708, y: 0.292 },
      green: { x: 0.170, y: 0.797 },
      blue: { x: 0.131, y: 0.046 },
    },
    whitePoint: { x: 0.3127, y: 0.3290 }, // D65
  },
  AdobeRGB: {
    name: 'Adobe RGB',
    primaries: {
      red: { x: 0.6400, y: 0.3300 },
      green: { x: 0.2100, y: 0.7100 },
      blue: { x: 0.1500, y: 0.0600 },
    },
    whitePoint: { x: 0.3127, y: 0.3290 }, // D65
  },
  NTSC: {
    name: 'NTSC',
    primaries: {
      red: { x: 0.67, y: 0.33 },
      green: { x: 0.21, y: 0.71 },
      blue: { x: 0.14, y: 0.08 },
    },
    whitePoint: { x: 0.3101, y: 0.3162 }, // Illuminant C
  },
};
