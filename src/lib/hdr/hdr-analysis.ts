/**
 * HDR10 metadata analysis utilities.
 */

interface ChromaticityPoint {
  x: number;
  y: number;
}

const BT2020_PRIMARIES = {
  r: { x: 0.708, y: 0.292 },
  g: { x: 0.17, y: 0.797 },
  b: { x: 0.131, y: 0.046 },
} as const;

/**
 * HDR10 static metadata subset used for capability analysis.
 */
export interface HDR10Metadata {
  maxCLL: number;
  maxFALL: number;
  masterDisplayMaxLuminance: number;
  masterDisplayMinLuminance: number;
  primaryR: { x: number; y: number };
  primaryG: { x: number; y: number };
  primaryB: { x: number; y: number };
  whitePoint: { x: number; y: number };
}

/**
 * Aggregated HDR analysis output.
 */
export interface HDRAnalysisResult {
  dynamicRange: number;
  peakBrightnessScore: { score: string; description: string };
  maxCLLToMaxFALLRatio: number;
  hdr10Grade: string;
  gamutCoverage: number;
}

function triangleArea(p1: ChromaticityPoint, p2: ChromaticityPoint, p3: ChromaticityPoint): number {
  return (
    0.5 *
    Math.abs(
      p1.x * (p2.y - p3.y) +
      p2.x * (p3.y - p1.y) +
      p3.x * (p1.y - p2.y),
    )
  );
}

function calculateBT2020Coverage(metadata: HDR10Metadata): number {
  const contentArea = triangleArea(metadata.primaryR, metadata.primaryG, metadata.primaryB);
  const bt2020Area = triangleArea(BT2020_PRIMARIES.r, BT2020_PRIMARIES.g, BT2020_PRIMARIES.b);

  if (bt2020Area === 0) {
    return 0;
  }

  const coverage = (contentArea / bt2020Area) * 100;
  return Math.min(Math.max(coverage, 0), 100);
}

function determineHDR10Grade(
  metadata: HDR10Metadata,
  dynamicRange: number,
  gamutCoverage: number,
): string {
  const isPremium =
    metadata.maxCLL >= 1000 &&
    metadata.maxFALL >= 400 &&
    metadata.masterDisplayMaxLuminance >= 1000 &&
    metadata.masterDisplayMinLuminance <= 0.05 &&
    dynamicRange >= 14 &&
    gamutCoverage >= 90;

  if (isPremium) {
    return 'Premium';
  }

  const isStandard =
    metadata.maxCLL >= 600 &&
    metadata.maxFALL >= 250 &&
    metadata.masterDisplayMaxLuminance >= 600 &&
    metadata.masterDisplayMinLuminance <= 0.1 &&
    dynamicRange >= 12 &&
    gamutCoverage >= 75;

  if (isStandard) {
    return 'Standard';
  }

  return 'Basic';
}

/**
 * Analyze HDR10 metadata and derive summary metrics.
 */
export function analyzeHDR10(metadata: HDR10Metadata): HDRAnalysisResult {
  const dynamicRange = calculateDynamicRange(
    metadata.masterDisplayMaxLuminance,
    metadata.masterDisplayMinLuminance,
  );
  const peakBrightnessScore = calculatePeakBrightnessScore(metadata.maxCLL);
  const maxCLLToMaxFALLRatio = metadata.maxFALL > 0 ? metadata.maxCLL / metadata.maxFALL : 0;
  const gamutCoverage = calculateBT2020Coverage(metadata);
  const hdr10Grade = determineHDR10Grade(metadata, dynamicRange, gamutCoverage);

  return {
    dynamicRange,
    peakBrightnessScore,
    maxCLLToMaxFALLRatio,
    hdr10Grade,
    gamutCoverage,
  };
}

/**
 * Calculate dynamic range in stops.
 */
export function calculateDynamicRange(maxNits: number, minNits: number): number {
  if (maxNits <= 0 || minNits <= 0 || maxNits <= minNits) {
    return 0;
  }
  return Math.log2(maxNits / minNits);
}

/**
 * Classify peak brightness capability.
 */
export function calculatePeakBrightnessScore(maxNits: number): { score: string; description: string } {
  if (maxNits < 400) {
    return { score: 'Basic SDR', description: 'Insufficient peak brightness for HDR highlights.' };
  }
  if (maxNits < 600) {
    return { score: 'HDR Entry', description: 'Entry-level HDR highlights with limited specular intensity.' };
  }
  if (maxNits < 1000) {
    return { score: 'HDR Standard', description: 'Solid HDR rendering for mainstream HDR10 content.' };
  }
  if (maxNits < 2000) {
    return { score: 'HDR Premium', description: 'High-impact HDR highlights with strong contrast perception.' };
  }
  if (maxNits <= 4000) {
    return { score: 'HDR Reference', description: 'Reference-class highlight reproduction for demanding content.' };
  }
  return { score: 'HDR Mastering', description: 'Mastering-level peak brightness headroom.' };
}
