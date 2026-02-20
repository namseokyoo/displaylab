/**
 * Tone mapping operators for HDR to SDR visualization workflows.
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeSteps(steps: number): number {
  return Math.max(2, Math.floor(steps));
}

/**
 * Reinhard global tone mapping.
 * Ld = L * (1 + L / Lmax^2) / (1 + L)
 */
export function reinhardToneMap(L: number, Lmax: number): number {
  const luminance = Math.max(L, 0);
  const maxLuminance = Math.max(Lmax, Number.EPSILON);
  const maxLuminanceSquared = maxLuminance * maxLuminance;
  return (luminance * (1 + luminance / maxLuminanceSquared)) / (1 + luminance);
}

function hableCurve(L: number): number {
  const A = 0.15;
  const B = 0.5;
  const C = 0.1;
  const D = 0.2;
  const E = 0.02;
  const F = 0.3;

  return ((L * (A * L + C * B) + D * E) / (L * (A * L + B) + D * F)) - E / F;
}

/**
 * Hable / Uncharted 2 filmic tone mapping.
 */
export function hableToneMap(L: number): number {
  const luminance = Math.max(L, 0);
  const whitePoint = 11.2;
  const whiteScale = 1 / hableCurve(whitePoint);
  return hableCurve(luminance) * whiteScale;
}

/**
 * ACES filmic approximation tone mapping.
 * (L * (2.51 * L + 0.03)) / (L * (2.43 * L + 0.59) + 0.14)
 */
export function acesToneMap(L: number): number {
  const luminance = Math.max(L, 0);
  const mapped =
    (luminance * (2.51 * luminance + 0.03)) /
    (luminance * (2.43 * luminance + 0.59) + 0.14);
  return clamp(mapped, 0, 1);
}

/**
 * Generate tone mapping curve data from 0 to max luminance.
 *
 * mapper receives: mapper(inputLuminance, maxLuminance)
 */
export function toneMapCurve(
  mapper: (L: number, ...args: number[]) => number,
  maxLuminance: number,
  steps: number = 1024,
): Array<{ input: number; output: number }> {
  const sampleCount = normalizeSteps(steps);
  const maxInput = Math.max(maxLuminance, 0);

  return Array.from({ length: sampleCount }, (_, index) => {
    const input = (index / (sampleCount - 1)) * maxInput;
    return {
      input,
      output: mapper(input, maxInput),
    };
  });
}
