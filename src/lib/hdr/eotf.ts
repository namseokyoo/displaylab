/**
 * HDR EOTF/OETF utilities.
 *
 * Includes:
 * - PQ (SMPTE ST 2084) EOTF and inverse EOTF
 * - HLG (BT.2100) OETF and EOTF
 * - SDR gamma reference EOTF
 */

const PQ_M1 = 0.1593017578125;
const PQ_M2 = 78.84375;
const PQ_C1 = 0.8359375;
const PQ_C2 = 18.8515625;
const PQ_C3 = 18.6875;
const PQ_MAX_NITS = 10000;

const HLG_A = 0.17883277;
const HLG_B = 1 - 4 * HLG_A;
const HLG_C = 0.5 - HLG_A * Math.log(4 * HLG_A);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeSteps(steps: number): number {
  return Math.max(2, Math.floor(steps));
}

/**
 * PQ EOTF (SMPTE ST 2084)
 * Converts normalized electrical signal (0-1) to absolute luminance (cd/m^2).
 */
export function pqEOTF(E: number): number {
  const signal = clamp(E, 0, 1);
  const power = Math.pow(signal, 1 / PQ_M2);
  const numerator = Math.max(power - PQ_C1, 0);
  const denominator = PQ_C2 - PQ_C3 * power;

  if (denominator <= 0) {
    return 0;
  }

  const normalizedLuminance = Math.pow(numerator / denominator, 1 / PQ_M1);
  return PQ_MAX_NITS * normalizedLuminance;
}

/**
 * Inverse PQ EOTF (SMPTE ST 2084)
 * Converts absolute luminance (cd/m^2) to normalized electrical signal (0-1).
 */
export function pqInverseEOTF(L: number): number {
  const normalizedLuminance = clamp(L, 0, PQ_MAX_NITS) / PQ_MAX_NITS;
  const power = Math.pow(normalizedLuminance, PQ_M1);
  const numerator = PQ_C1 + PQ_C2 * power;
  const denominator = 1 + PQ_C3 * power;

  if (denominator <= 0) {
    return 0;
  }

  return clamp(Math.pow(numerator / denominator, PQ_M2), 0, 1);
}

/**
 * Generate PQ luminance curve from 0-1 input domain.
 */
export function generatePQCurve(
  steps: number = 1024,
): Array<{ input: number; luminance: number }> {
  const sampleCount = normalizeSteps(steps);

  return Array.from({ length: sampleCount }, (_, index) => {
    const input = index / (sampleCount - 1);
    return {
      input,
      luminance: pqEOTF(input),
    };
  });
}

/**
 * HLG OETF (BT.2100)
 * Converts normalized scene linear light (0-1) to electrical signal (0-1).
 */
export function hlgOETF(L: number): number {
  const sceneLuminance = clamp(L, 0, 1);
  if (sceneLuminance <= 1 / 12) {
    return Math.sqrt(3 * sceneLuminance);
  }
  return HLG_A * Math.log(12 * sceneLuminance - HLG_B) + HLG_C;
}

function hlgInverseOETF(E: number): number {
  if (E <= 0.5) {
    return (E * E) / 3;
  }
  return (Math.exp((E - HLG_C) / HLG_A) + HLG_B) / 12;
}

function hlgSystemGamma(Lw: number): number {
  const peakLuminance = Math.max(Lw, 1);
  return 1.2 + 0.42 * Math.log10(peakLuminance / 1000);
}

/**
 * HLG EOTF (BT.2100)
 * Converts electrical signal (0-1) to display luminance (cd/m^2).
 *
 * @param E Electrical signal in 0-1 range
 * @param Lw Display peak luminance in nits (default: 1000)
 */
export function hlgEOTF(E: number, Lw: number = 1000): number {
  const signal = clamp(E, 0, 1);
  const peakLuminance = Math.max(Lw, 0);
  const sceneLuminance = Math.max(hlgInverseOETF(signal), 0);
  const gamma = hlgSystemGamma(peakLuminance);
  return peakLuminance * Math.pow(sceneLuminance, gamma);
}

/**
 * Generate HLG luminance curve from 0-1 input domain.
 */
export function generateHLGCurve(
  steps: number = 1024,
  Lw: number = 1000,
): Array<{ input: number; luminance: number }> {
  const sampleCount = normalizeSteps(steps);

  return Array.from({ length: sampleCount }, (_, index) => {
    const input = index / (sampleCount - 1);
    return {
      input,
      luminance: hlgEOTF(input, Lw),
    };
  });
}

/**
 * SDR gamma EOTF reference.
 * Converts normalized electrical signal (0-1) to normalized output luminance.
 */
export function gammaEOTF(E: number, gamma: number = 2.4): number {
  const signal = clamp(E, 0, 1);
  const safeGamma = gamma > 0 ? gamma : 2.4;
  return Math.pow(signal, safeGamma);
}

/**
 * Generate SDR gamma curve from 0-1 input domain.
 */
export function generateGammaCurve(
  steps: number = 1024,
  gamma: number = 2.4,
): Array<{ input: number; luminance: number }> {
  const sampleCount = normalizeSteps(steps);

  return Array.from({ length: sampleCount }, (_, index) => {
    const input = index / (sampleCount - 1);
    return {
      input,
      luminance: gammaEOTF(input, gamma),
    };
  });
}
