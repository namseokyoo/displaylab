/**
 * Display Lab Type Definitions
 *
 * Includes types from ISCV (spectrum.ts) and Display Lab-specific types.
 */

// ============================================================
// ISCV types (from spectrum-visualizer/types/spectrum.ts)
// ============================================================

/** Spectrum data point */
export interface SpectrumPoint {
  wavelength: number; // nm
  intensity: number; // 0-1 (normalized)
}

/** Full spectrum data */
export interface SpectrumData {
  points: SpectrumPoint[];
  minWavelength: number;
  maxWavelength: number;
  peakWavelength: number;
}

/** CIE XYZ tristimulus values */
export interface XYZColor {
  X: number;
  Y: number;
  Z: number;
}

/** CIE 1931 xy chromaticity coordinates */
export interface CIE1931Coordinates {
  x: number;
  y: number;
}

/** CIE 1976 u'v' chromaticity coordinates */
export interface CIE1976Coordinates {
  u: number;
  v: number;
}

/** Combined chromaticity result */
export interface ChromaticityResult {
  xyz: XYZColor;
  cie1931: CIE1931Coordinates;
  cie1976: CIE1976Coordinates;
  dominantWavelength: number;
  hexColor: string;
}

/** Diagram mode */
export type DiagramMode = 'CIE1931' | 'CIE1976';

/** Color gamut type */
export type GamutType = 'sRGB' | 'DCI-P3' | 'BT.2020' | 'AdobeRGB' | 'NTSC';

// ============================================================
// Display Lab-specific types
// ============================================================

/** Color gamut data for a display */
export interface GamutData {
  name: string;
  primaries: {
    red: { x: number; y: number };
    green: { x: number; y: number };
    blue: { x: number; y: number };
  };
  whitePoint?: { x: number; y: number };
}

/** Standard gamut definition */
export interface StandardGamut {
  name: string;
  primaries: GamutData['primaries'];
  whitePoint: { x: number; y: number };
}

/** Viewing angle measurement data point */
export interface ViewingAngleData {
  angle: number; // measurement angle (0-80 degrees)
  luminance: number; // cd/m2
  cieX: number; // CIE x coordinate
  cieY: number; // CIE y coordinate
  // Computed values
  deltaE_ab?: number; // Delta E*ab (vs 0 degree)
  deltaE_2000?: number; // CIEDE2000 (vs 0 degree)
  contrastRatio?: number; // Contrast ratio
}

/** CIE Lab color */
export interface LabColor {
  L: number;
  a: number;
  b: number;
}

/** Delta E calculation result */
export interface DeltaEResult {
  deltaE76: number;
  deltaE94: number;
  deltaE2000: number;
}

/** CCT calculation result */
export interface CCTResult {
  cct: number; // Correlated Color Temperature (K)
  duv: number; // Distance from Planckian locus
}

/** Gamut coverage result */
export interface GamutCoverageResult {
  area: number; // Absolute area in CIE xy or u'v'
  coverages: Record<string, number>; // Percentage coverage vs each standard
}

/** CIE Diagram marker */
export interface DiagramMarker {
  x: number;
  y: number;
  color: string;
  label?: string;
}

/** Custom primaries for CIE diagram overlay */
export interface CustomPrimaries {
  name: string;
  primaries: {
    red: { x: number; y: number };
    green: { x: number; y: number };
    blue: { x: number; y: number };
  };
  color: string;
}
