/**
 * Universal Color Space Converter Component
 *
 * Converts between 10 color spaces using XYZ as the hub.
 * Supports: XYZ, xyY, u'v'Y, Lab, LCh, sRGB, Linear RGB, HSL, Hex, CMYK.
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { XYZColor } from '@/types';
import { xyzToXY } from '@/lib/cie';
import {
  xyzToRGB,
  xyzToLab,
  labToXyz,
  xyYToXYZ,
  rgbToHex,
  xyzToUvY,
  uvYToXyz,
  labToLCh,
  lchToLab,
  rgbToXyz,
  xyzToLinearRGB,
  linearRGBToXyz,
  rgbToHSL,
  hslToRGB,
  hexToRGB,
  rgbToCMYK,
  cmykToRGB,
  isInSRGBGamut,
} from '@/lib/color-convert';

// ============================================================
// Types
// ============================================================

type ColorSpaceId =
  | 'xyz'
  | 'xyY'
  | 'uvY'
  | 'lab'
  | 'lch'
  | 'srgb'
  | 'linear-rgb'
  | 'hsl'
  | 'hex'
  | 'cmyk';

interface ColorSpaceDefinition {
  id: ColorSpaceId;
  label: string;
  fields: FieldDefinition[];
}

interface FieldDefinition {
  key: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  isText?: boolean;
}

// ============================================================
// Color Space Definitions
// ============================================================

const COLOR_SPACES: ColorSpaceDefinition[] = [
  {
    id: 'xyz',
    label: 'CIE XYZ',
    fields: [
      { key: 'X', label: 'X', min: 0, max: 150, step: 0.001 },
      { key: 'Y', label: 'Y', min: 0, max: 150, step: 0.001 },
      { key: 'Z', label: 'Z', min: 0, max: 150, step: 0.001 },
    ],
  },
  {
    id: 'xyY',
    label: 'CIE 1931 xyY',
    fields: [
      { key: 'x', label: 'x', min: 0, max: 1, step: 0.0001 },
      { key: 'y', label: 'y', min: 0, max: 1, step: 0.0001 },
      { key: 'Y', label: 'Y', min: 0, max: 100, step: 0.01 },
    ],
  },
  {
    id: 'uvY',
    label: "CIE 1976 u'v'Y",
    fields: [
      { key: 'u', label: "u'", min: 0, max: 0.7, step: 0.0001 },
      { key: 'v', label: "v'", min: 0, max: 0.7, step: 0.0001 },
      { key: 'Y', label: 'Y', min: 0, max: 100, step: 0.01 },
    ],
  },
  {
    id: 'lab',
    label: 'CIE L*a*b*',
    fields: [
      { key: 'L', label: 'L*', min: 0, max: 100, step: 0.01 },
      { key: 'a', label: 'a*', min: -128, max: 128, step: 0.01 },
      { key: 'b', label: 'b*', min: -128, max: 128, step: 0.01 },
    ],
  },
  {
    id: 'lch',
    label: 'CIE LCh',
    fields: [
      { key: 'L', label: 'L*', min: 0, max: 100, step: 0.01 },
      { key: 'C', label: 'C*', min: 0, max: 200, step: 0.01 },
      { key: 'h', label: 'h\u00b0', min: 0, max: 360, step: 0.1 },
    ],
  },
  {
    id: 'srgb',
    label: 'sRGB (0-255)',
    fields: [
      { key: 'R', label: 'R', min: 0, max: 255, step: 1 },
      { key: 'G', label: 'G', min: 0, max: 255, step: 1 },
      { key: 'B', label: 'B', min: 0, max: 255, step: 1 },
    ],
  },
  {
    id: 'linear-rgb',
    label: 'Linear RGB',
    fields: [
      { key: 'R', label: 'R', min: 0, max: 1, step: 0.001 },
      { key: 'G', label: 'G', min: 0, max: 1, step: 0.001 },
      { key: 'B', label: 'B', min: 0, max: 1, step: 0.001 },
    ],
  },
  {
    id: 'hsl',
    label: 'HSL',
    fields: [
      { key: 'H', label: 'H\u00b0', min: 0, max: 360, step: 0.1 },
      { key: 'S', label: 'S%', min: 0, max: 100, step: 0.1 },
      { key: 'L', label: 'L%', min: 0, max: 100, step: 0.1 },
    ],
  },
  {
    id: 'hex',
    label: 'Hex',
    fields: [{ key: 'hex', label: '#RRGGBB', isText: true }],
  },
  {
    id: 'cmyk',
    label: 'CMYK',
    fields: [
      { key: 'C', label: 'C%', min: 0, max: 100, step: 0.1 },
      { key: 'M', label: 'M%', min: 0, max: 100, step: 0.1 },
      { key: 'Y', label: 'Y%', min: 0, max: 100, step: 0.1 },
      { key: 'K', label: 'K%', min: 0, max: 100, step: 0.1 },
    ],
  },
];

const COLOR_SPACE_IDS: ColorSpaceId[] = ['xyz', 'xyY', 'uvY', 'lab', 'lch', 'srgb', 'linear-rgb', 'hsl', 'hex', 'cmyk'];

// ============================================================
// Default values
// ============================================================

function getDefaultValues(spaceId: ColorSpaceId): Record<string, string> {
  switch (spaceId) {
    case 'xyz':
      return { X: '95.047', Y: '100.000', Z: '108.883' };
    case 'xyY':
      return { x: '0.3127', y: '0.3290', Y: '100.000' };
    case 'uvY':
      return { u: '0.1978', v: '0.4683', Y: '100.000' };
    case 'lab':
      return { L: '100.000', a: '0.000', b: '0.000' };
    case 'lch':
      return { L: '100.000', C: '0.000', h: '0.000' };
    case 'srgb':
      return { R: '255', G: '255', B: '255' };
    case 'linear-rgb':
      return { R: '1.000', G: '1.000', B: '1.000' };
    case 'hsl':
      return { H: '0', S: '0', L: '100' };
    case 'hex':
      return { hex: '#FFFFFF' };
    case 'cmyk':
      return { C: '0', M: '0', Y: '0', K: '0' };
  }
}

// ============================================================
// Conversion: Source -> XYZ
// ============================================================

function sourceToXYZ(spaceId: ColorSpaceId, values: Record<string, string>): XYZColor | null {
  const num = (key: string) => {
    const n = parseFloat(values[key] ?? '0');
    return isNaN(n) ? 0 : n;
  };

  try {
    switch (spaceId) {
      case 'xyz':
        return { X: num('X'), Y: num('Y'), Z: num('Z') };

      case 'xyY':
        return xyYToXYZ(num('x'), num('y'), num('Y'));

      case 'uvY':
        return uvYToXyz(num('u'), num('v'), num('Y'));

      case 'lab':
        return labToXyz({ L: num('L'), a: num('a'), b: num('b') });

      case 'lch': {
        const lab = lchToLab(num('L'), num('C'), num('h'));
        return labToXyz(lab);
      }

      case 'srgb':
        return rgbToXyz(num('R'), num('G'), num('B'));

      case 'linear-rgb':
        return linearRGBToXyz(num('R'), num('G'), num('B'));

      case 'hsl': {
        const rgb = hslToRGB(num('H'), num('S'), num('L'));
        return rgbToXyz(rgb.r, rgb.g, rgb.b);
      }

      case 'hex': {
        const hexVal = values.hex ?? '#000000';
        if (!/^#?[0-9A-Fa-f]{3,6}$/.test(hexVal)) return null;
        const rgb = hexToRGB(hexVal);
        return rgbToXyz(rgb.r, rgb.g, rgb.b);
      }

      case 'cmyk': {
        const rgb = cmykToRGB(num('C'), num('M'), num('Y'), num('K'));
        return rgbToXyz(rgb.r, rgb.g, rgb.b);
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ============================================================
// Conversion: XYZ -> All Results
// ============================================================

interface ConversionResults {
  xyz: { X: number; Y: number; Z: number };
  xyY: { x: number; y: number; Y: number };
  uvY: { u: number; v: number; Y: number };
  lab: { L: number; a: number; b: number };
  lch: { L: number; C: number; h: number };
  srgb: { R: number; G: number; B: number };
  linearRgb: { R: number; G: number; B: number };
  hsl: { H: number; S: number; L: number };
  hex: string;
  cmyk: { C: number; M: number; Y: number; K: number };
  inGamut: boolean;
  previewHex: string;
}

function xyzToAllSpaces(xyz: XYZColor): ConversionResults {
  // XYZ
  const xyzResult = { X: xyz.X, Y: xyz.Y, Z: xyz.Z };

  // xyY
  const xy = xyzToXY(xyz);
  const xyYResult = { x: xy.x, y: xy.y, Y: xyz.Y };

  // u'v'Y
  const uvY = xyzToUvY(xyz);

  // Lab
  const lab = xyzToLab(xyz);

  // LCh
  const lch = labToLCh(lab);

  // sRGB
  const srgb = xyzToRGB(xyz);
  const srgbResult = { R: srgb.r, G: srgb.g, B: srgb.b };

  // Linear RGB
  const linear = xyzToLinearRGB(xyz);
  const linearResult = { R: linear.r, G: linear.g, B: linear.b };

  // HSL (from sRGB)
  const hsl = rgbToHSL(srgb.r, srgb.g, srgb.b);
  const hslResult = { H: hsl.h, S: hsl.s, L: hsl.l };

  // Hex
  const hex = rgbToHex(srgb.r, srgb.g, srgb.b);

  // CMYK (from sRGB)
  const cmyk = rgbToCMYK(srgb.r, srgb.g, srgb.b);

  // Gamut check
  const inGamut = isInSRGBGamut(xyz);

  // Preview hex (clamped sRGB)
  const previewHex = hex;

  return {
    xyz: xyzResult,
    xyY: xyYResult,
    uvY,
    lab: { L: lab.L, a: lab.a, b: lab.b },
    lch,
    srgb: srgbResult,
    linearRgb: linearResult,
    hsl: hslResult,
    hex,
    cmyk: { C: cmyk.c, M: cmyk.m, Y: cmyk.y, K: cmyk.k },
    inGamut,
    previewHex,
  };
}

// ============================================================
// Format helpers
// ============================================================

function fmt(n: number, decimals: number = 4): string {
  return n.toFixed(decimals);
}

// ============================================================
// Result Card Component
// ============================================================

function ResultCard({
  label,
  values,
  isSource,
  sourceLabel,
}: {
  label: string;
  values: { label: string; value: string }[];
  isSource: boolean;
  sourceLabel?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        isSource
          ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700/50'
          : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50'
      }`}
    >
      <div className={`text-xs mb-2 font-medium ${isSource ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
        {isSource && <span className="ml-1 text-blue-500">{sourceLabel}</span>}
      </div>
      <div className={`grid gap-1 ${values.length === 4 ? 'grid-cols-4' : values.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {values.map((v) => (
          <div key={v.label}>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">{v.label}</div>
            <div className="text-xs font-mono text-gray-900 dark:text-white truncate" title={v.value}>{v.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

interface UniversalConverterProps {
  initialSpace?: string | null;
  initialValues?: Record<string, string> | null;
  onStateChange?: (space: string, values: Record<string, string>) => void;
}

export default function UniversalConverter({ initialSpace, initialValues, onStateChange }: UniversalConverterProps) {
  const { t } = useTranslation();
  const hasValidInitialSpace = initialSpace
    ? COLOR_SPACE_IDS.includes(initialSpace as ColorSpaceId)
    : false;
  const initialSourceSpace = hasValidInitialSpace ? (initialSpace as ColorSpaceId) : 'xyz';

  const [sourceSpace, setSourceSpace] = useState<ColorSpaceId>(initialSourceSpace);
  const [values, setValues] = useState<Record<string, string>>(
    initialValues && hasValidInitialSpace ? initialValues : getDefaultValues(initialSourceSpace),
  );

  // Report state changes to parent
  useEffect(() => {
    onStateChange?.(sourceSpace, values);
  }, [sourceSpace, values, onStateChange]);

  const handleSourceChange = useCallback((newSpace: ColorSpaceId) => {
    setSourceSpace(newSpace);
    setValues(getDefaultValues(newSpace));
  }, []);

  const handleValueChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const spaceDef = COLOR_SPACES.find((s) => s.id === sourceSpace)!;

  const results = (() => {
    const xyz = sourceToXYZ(sourceSpace, values);
    if (!xyz) return null;
    return xyzToAllSpaces(xyz);
  })();

  const resultCards = (() => {
    if (!results) return [];

    return [
      {
        id: 'xyz' as const,
        label: 'CIE XYZ',
        values: [
          { label: 'X', value: fmt(results.xyz.X) },
          { label: 'Y', value: fmt(results.xyz.Y) },
          { label: 'Z', value: fmt(results.xyz.Z) },
        ],
      },
      {
        id: 'xyY' as const,
        label: 'CIE 1931 xyY',
        values: [
          { label: 'x', value: fmt(results.xyY.x, 6) },
          { label: 'y', value: fmt(results.xyY.y, 6) },
          { label: 'Y', value: fmt(results.xyY.Y) },
        ],
      },
      {
        id: 'uvY' as const,
        label: "CIE 1976 u'v'Y",
        values: [
          { label: "u'", value: fmt(results.uvY.u, 6) },
          { label: "v'", value: fmt(results.uvY.v, 6) },
          { label: 'Y', value: fmt(results.uvY.Y) },
        ],
      },
      {
        id: 'lab' as const,
        label: 'CIE L*a*b*',
        values: [
          { label: 'L*', value: fmt(results.lab.L, 2) },
          { label: 'a*', value: fmt(results.lab.a, 2) },
          { label: 'b*', value: fmt(results.lab.b, 2) },
        ],
      },
      {
        id: 'lch' as const,
        label: 'CIE LCh',
        values: [
          { label: 'L*', value: fmt(results.lch.L, 2) },
          { label: 'C*', value: fmt(results.lch.C, 2) },
          { label: 'h\u00b0', value: fmt(results.lch.h, 1) },
        ],
      },
      {
        id: 'srgb' as const,
        label: 'sRGB (0-255)',
        values: [
          { label: 'R', value: String(results.srgb.R) },
          { label: 'G', value: String(results.srgb.G) },
          { label: 'B', value: String(results.srgb.B) },
        ],
      },
      {
        id: 'linear-rgb' as const,
        label: 'Linear RGB',
        values: [
          { label: 'R', value: fmt(results.linearRgb.R, 6) },
          { label: 'G', value: fmt(results.linearRgb.G, 6) },
          { label: 'B', value: fmt(results.linearRgb.B, 6) },
        ],
      },
      {
        id: 'hsl' as const,
        label: 'HSL',
        values: [
          { label: 'H\u00b0', value: fmt(results.hsl.H, 1) },
          { label: 'S%', value: fmt(results.hsl.S, 1) },
          { label: 'L%', value: fmt(results.hsl.L, 1) },
        ],
      },
      {
        id: 'hex' as const,
        label: 'Hex',
        values: [{ label: '#RRGGBB', value: results.hex }],
      },
      {
        id: 'cmyk' as const,
        label: 'CMYK',
        values: [
          { label: 'C%', value: fmt(results.cmyk.C, 1) },
          { label: 'M%', value: fmt(results.cmyk.M, 1) },
          { label: 'Y%', value: fmt(results.cmyk.Y, 1) },
          { label: 'K%', value: fmt(results.cmyk.K, 1) },
        ],
      },
    ];
  })();

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('color.uniTitle')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('color.uniSubtitle')}
      </p>

      {/* Source color space selector */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('color.sourceColorSpace')}</label>
        <select
          value={sourceSpace}
          onChange={(e) => handleSourceChange(e.target.value as ColorSpaceId)}
          className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          {COLOR_SPACES.map((cs) => (
            <option key={cs.id} value={cs.id}>
              {cs.label}
            </option>
          ))}
        </select>
      </div>

      {/* Input fields */}
      <div className="space-y-3 mb-4">
        {spaceDef.fields.map((field) => (
          <label key={field.key} className="block">
            <span className="text-xs text-gray-500 dark:text-gray-400">{field.label}</span>
            {field.isText ? (
              <input
                type="text"
                value={values[field.key] ?? ''}
                onChange={(e) => handleValueChange(field.key, e.target.value)}
                placeholder="#FFFFFF"
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <input
                type="number"
                step={field.step ?? 'any'}
                min={field.min}
                max={field.max}
                value={values[field.key] ?? ''}
                onChange={(e) => handleValueChange(field.key, e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            )}
          </label>
        ))}
      </div>

      {/* Color preview + Gamut warning */}
      {results && (
        <div className="mb-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-700 flex-shrink-0"
            style={{ backgroundColor: results.previewHex }}
          />
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('color.previewSrgb')}</div>
            <div className="text-sm font-mono text-gray-900 dark:text-white">{results.previewHex}</div>
            {!results.inGamut && (
              <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('color.outOfGamut')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversion results */}
      {results ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('color.allColorSpaces')}</div>
          {resultCards.map((card) => (
            <ResultCard
              key={card.id}
              label={card.label}
              values={card.values}
              isSource={card.id === sourceSpace}
              sourceLabel={t('color.source')}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 text-center">
          <div className="text-sm text-gray-400 dark:text-gray-500">{t('common.invalid')}</div>
        </div>
      )}
    </div>
  );
}
