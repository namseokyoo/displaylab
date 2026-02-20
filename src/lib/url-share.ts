import type { DiagramMode, GamutData } from '@/types';

/**
 * Encode gamut analyzer state into URL search params string.
 * Format: ?r=0.64,0.33&g=0.30,0.60&b=0.15,0.06&wp=0.3127,0.3290&name=MyDisplay&mode=CIE1931
 */
export function encodeGamutState(displays: GamutData[], mode: DiagramMode): string {
  const params = new URLSearchParams();
  // Encode first display only (primary)
  const d = displays[0];
  if (!d) return '';
  params.set('r', `${d.primaries.red.x},${d.primaries.red.y}`);
  params.set('g', `${d.primaries.green.x},${d.primaries.green.y}`);
  params.set('b', `${d.primaries.blue.x},${d.primaries.blue.y}`);
  if (d.whitePoint) {
    params.set('wp', `${d.whitePoint.x},${d.whitePoint.y}`);
  }
  if (d.name && d.name !== 'My Display') {
    params.set('name', d.name);
  }
  params.set('mode', mode);
  return params.toString();
}

/**
 * Decode URL params back to gamut state.
 * Returns null if params are invalid or missing.
 */
export function decodeGamutState(
  params: URLSearchParams,
): { displays: GamutData[]; mode: DiagramMode } | null {
  const r = params.get('r');
  const g = params.get('g');
  const b = params.get('b');
  const modeParam = params.get('mode');

  if (!r || !g || !b) return null;

  const parseCoord = (s: string): { x: number; y: number } | null => {
    const parts = s.split(',').map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    const [x, y] = parts;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return { x, y };
  };

  const red = parseCoord(r);
  const green = parseCoord(g);
  const blue = parseCoord(b);
  if (!red || !green || !blue) return null;

  const mode: DiagramMode = modeParam === 'CIE1976' ? 'CIE1976' : 'CIE1931';
  const name = params.get('name') || 'Shared Display';

  const wpStr = params.get('wp');
  const whitePoint = wpStr ? parseCoord(wpStr) ?? undefined : undefined;

  return {
    displays: [{ name, primaries: { red, green, blue }, whitePoint }],
    mode,
  };
}

/**
 * Encode color calculator state into URL search params string.
 * Format: ?space=xyz&X=95.047&Y=100&Z=108.883
 */
export function encodeColorState(space: string, values: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set('space', space);
  for (const [key, val] of Object.entries(values)) {
    params.set(key, val);
  }
  return params.toString();
}

/**
 * Decode URL params back to color calculator state.
 * Returns null if params are invalid.
 */
export function decodeColorState(
  params: URLSearchParams,
): { space: string; values: Record<string, string> } | null {
  const space = params.get('space');
  if (!space) return null;

  const validSpaces = ['xyz', 'xyY', 'uvY', 'lab', 'lch', 'srgb', 'linear-rgb', 'hsl', 'hex', 'cmyk'];
  if (!validSpaces.includes(space)) return null;

  const values: Record<string, string> = {};
  params.forEach((val, key) => {
    if (key !== 'space') {
      values[key] = val;
    }
  });

  if (Object.keys(values).length === 0) return null;

  return { space, values };
}
