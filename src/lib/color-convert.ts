/**
 * Color Space Conversions
 *
 * XYZ to RGB and other color format conversions.
 * Ported from ISCV color-convert.ts.
 */

import type { XYZColor, LabColor } from '@/types';

/** sRGB color matrix (D65 illuminant) - XYZ to linear RGB */
const XYZ_TO_SRGB_MATRIX = [
  [3.2406, -1.5372, -0.4986],
  [-0.9689, 1.8758, 0.0415],
  [0.0557, -0.204, 1.057],
];

/** Apply sRGB gamma correction */
function srgbGamma(linear: number): number {
  if (linear <= 0.0031308) {
    return 12.92 * linear;
  }
  return 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/** Clamp value between 0 and 1 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Convert XYZ to sRGB (Y normalized to 100)
 */
export function xyzToRGB(xyz: XYZColor): { r: number; g: number; b: number } {
  const X = xyz.X / 100;
  const Y = xyz.Y / 100;
  const Z = xyz.Z / 100;

  const linearR =
    XYZ_TO_SRGB_MATRIX[0][0] * X + XYZ_TO_SRGB_MATRIX[0][1] * Y + XYZ_TO_SRGB_MATRIX[0][2] * Z;
  const linearG =
    XYZ_TO_SRGB_MATRIX[1][0] * X + XYZ_TO_SRGB_MATRIX[1][1] * Y + XYZ_TO_SRGB_MATRIX[1][2] * Z;
  const linearB =
    XYZ_TO_SRGB_MATRIX[2][0] * X + XYZ_TO_SRGB_MATRIX[2][1] * Y + XYZ_TO_SRGB_MATRIX[2][2] * Z;

  return {
    r: Math.round(clamp01(srgbGamma(linearR)) * 255),
    g: Math.round(clamp01(srgbGamma(linearG)) * 255),
    b: Math.round(clamp01(srgbGamma(linearB)) * 255),
  };
}

/** Convert RGB to hex color string */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = Math.round(clamp01(value / 255) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** Convert XYZ to hex color string */
export function xyzToHex(xyz: XYZColor): string {
  const { r, g, b } = xyzToRGB(xyz);
  return rgbToHex(r, g, b);
}

/**
 * D65 white point reference for Lab conversions
 */
const D65_WHITE: XYZColor = { X: 95.047, Y: 100.0, Z: 108.883 };

/**
 * Convert XYZ to CIE Lab
 * Reference white: D65
 */
export function xyzToLab(xyz: XYZColor, whitePoint: XYZColor = D65_WHITE): LabColor {
  const epsilon = 0.008856; // 216/24389
  const kappa = 903.3; // 24389/27

  const fx = xyz.X / whitePoint.X;
  const fy = xyz.Y / whitePoint.Y;
  const fz = xyz.Z / whitePoint.Z;

  const f = (t: number) => (t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116);

  const fxr = f(fx);
  const fyr = f(fy);
  const fzr = f(fz);

  return {
    L: 116 * fyr - 16,
    a: 500 * (fxr - fyr),
    b: 200 * (fyr - fzr),
  };
}

/**
 * Convert CIE Lab to XYZ
 * Reference white: D65
 */
export function labToXyz(lab: LabColor, whitePoint: XYZColor = D65_WHITE): XYZColor {
  const epsilon = 0.008856;
  const kappa = 903.3;

  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;

  const xr = fx * fx * fx > epsilon ? fx * fx * fx : (116 * fx - 16) / kappa;
  const yr = lab.L > kappa * epsilon ? Math.pow((lab.L + 16) / 116, 3) : lab.L / kappa;
  const zr = fz * fz * fz > epsilon ? fz * fz * fz : (116 * fz - 16) / kappa;

  return {
    X: xr * whitePoint.X,
    Y: yr * whitePoint.Y,
    Z: zr * whitePoint.Z,
  };
}

/**
 * Convert CIE 1931 xy + Y to XYZ
 */
export function xyYToXYZ(x: number, y: number, Y: number): XYZColor {
  if (y === 0) {
    return { X: 0, Y: 0, Z: 0 };
  }
  return {
    X: (x * Y) / y,
    Y: Y,
    Z: ((1 - x - y) * Y) / y,
  };
}
