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

// ============================================================
// Universal Converter: Additional Color Space Conversions
// ============================================================

/** sRGB to Linear RGB matrix (D65) - Linear RGB to XYZ */
const SRGB_TO_XYZ_MATRIX = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041],
];

/**
 * Inverse sRGB gamma (sRGB companding to linear)
 */
function srgbInverseGamma(c: number): number {
  if (c <= 0.04045) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Convert XYZ to CIE 1976 u'v'Y
 */
export function xyzToUvY(xyz: XYZColor): { u: number; v: number; Y: number } {
  const { X, Y, Z } = xyz;
  const denom = X + 15 * Y + 3 * Z;

  if (denom === 0) {
    return { u: 0, v: 0, Y: 0 };
  }

  return {
    u: (4 * X) / denom,
    v: (9 * Y) / denom,
    Y,
  };
}

/**
 * Convert CIE 1976 u'v'Y to XYZ
 */
export function uvYToXyz(u: number, v: number, Y: number): XYZColor {
  if (v === 0) {
    return { X: 0, Y: 0, Z: 0 };
  }

  const X = (9 * u * Y) / (4 * v);
  const Z = (12 - 3 * u - 20 * v) * Y / (4 * v);

  return { X, Y, Z };
}

/**
 * Convert CIE Lab to LCh
 */
export function labToLCh(lab: LabColor): { L: number; C: number; h: number } {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L: lab.L, C, h };
}

/**
 * Convert LCh to CIE Lab
 */
export function lchToLab(L: number, C: number, h: number): LabColor {
  const hRad = h * (Math.PI / 180);
  return {
    L,
    a: C * Math.cos(hRad),
    b: C * Math.sin(hRad),
  };
}

/**
 * Convert sRGB (0-255) to XYZ (Y normalized to 100)
 */
export function rgbToXyz(r: number, g: number, b: number): XYZColor {
  const rLinear = srgbInverseGamma(r / 255);
  const gLinear = srgbInverseGamma(g / 255);
  const bLinear = srgbInverseGamma(b / 255);

  return {
    X: (SRGB_TO_XYZ_MATRIX[0][0] * rLinear + SRGB_TO_XYZ_MATRIX[0][1] * gLinear + SRGB_TO_XYZ_MATRIX[0][2] * bLinear) * 100,
    Y: (SRGB_TO_XYZ_MATRIX[1][0] * rLinear + SRGB_TO_XYZ_MATRIX[1][1] * gLinear + SRGB_TO_XYZ_MATRIX[1][2] * bLinear) * 100,
    Z: (SRGB_TO_XYZ_MATRIX[2][0] * rLinear + SRGB_TO_XYZ_MATRIX[2][1] * gLinear + SRGB_TO_XYZ_MATRIX[2][2] * bLinear) * 100,
  };
}

/**
 * Convert XYZ to Linear RGB (0-1, no gamma)
 * XYZ with Y normalized to 100
 */
export function xyzToLinearRGB(xyz: XYZColor): { r: number; g: number; b: number } {
  const X = xyz.X / 100;
  const Y = xyz.Y / 100;
  const Z = xyz.Z / 100;

  return {
    r: XYZ_TO_SRGB_MATRIX[0][0] * X + XYZ_TO_SRGB_MATRIX[0][1] * Y + XYZ_TO_SRGB_MATRIX[0][2] * Z,
    g: XYZ_TO_SRGB_MATRIX[1][0] * X + XYZ_TO_SRGB_MATRIX[1][1] * Y + XYZ_TO_SRGB_MATRIX[1][2] * Z,
    b: XYZ_TO_SRGB_MATRIX[2][0] * X + XYZ_TO_SRGB_MATRIX[2][1] * Y + XYZ_TO_SRGB_MATRIX[2][2] * Z,
  };
}

/**
 * Convert Linear RGB (0-1) to XYZ (Y normalized to 100)
 */
export function linearRGBToXyz(r: number, g: number, b: number): XYZColor {
  return {
    X: (SRGB_TO_XYZ_MATRIX[0][0] * r + SRGB_TO_XYZ_MATRIX[0][1] * g + SRGB_TO_XYZ_MATRIX[0][2] * b) * 100,
    Y: (SRGB_TO_XYZ_MATRIX[1][0] * r + SRGB_TO_XYZ_MATRIX[1][1] * g + SRGB_TO_XYZ_MATRIX[1][2] * b) * 100,
    Z: (SRGB_TO_XYZ_MATRIX[2][0] * r + SRGB_TO_XYZ_MATRIX[2][1] * g + SRGB_TO_XYZ_MATRIX[2][2] * b) * 100,
  };
}

/**
 * Convert sRGB (0-255) to HSL
 */
export function rgbToHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to sRGB (0-255)
 */
export function hslToRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hNorm) * 255),
    b: Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Convert hex color string to RGB (0-255)
 */
export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Convert sRGB (0-255) to CMYK (0-100%)
 */
export function rgbToCMYK(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return {
    c: ((1 - rNorm - k) / (1 - k)) * 100,
    m: ((1 - gNorm - k) / (1 - k)) * 100,
    y: ((1 - bNorm - k) / (1 - k)) * 100,
    k: k * 100,
  };
}

/**
 * Convert CMYK (0-100%) to sRGB (0-255)
 */
export function cmykToRGB(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
  const cNorm = c / 100;
  const mNorm = m / 100;
  const yNorm = y / 100;
  const kNorm = k / 100;

  return {
    r: Math.round(255 * (1 - cNorm) * (1 - kNorm)),
    g: Math.round(255 * (1 - mNorm) * (1 - kNorm)),
    b: Math.round(255 * (1 - yNorm) * (1 - kNorm)),
  };
}

/**
 * Check if XYZ color is within sRGB gamut
 * Returns true if all linear RGB components are within [0, 1]
 */
export function isInSRGBGamut(xyz: XYZColor): boolean {
  const linear = xyzToLinearRGB(xyz);
  const tolerance = -0.001; // small tolerance for floating point
  return (
    linear.r >= tolerance && linear.r <= 1.001 &&
    linear.g >= tolerance && linear.g <= 1.001 &&
    linear.b >= tolerance && linear.b <= 1.001
  );
}
