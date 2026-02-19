/**
 * GamutDiagram Component
 *
 * Wraps CIEDiagram with gamut analyzer specific features:
 * - Standard gamut overlay toggles
 * - Custom primaries triangle rendering
 * - CIE mode toggle (1931/1976)
 * - Responsive sizing
 */

import { useMemo } from 'react';
import CIEDiagram from '@/components/common/CIEDiagram';
import type { DiagramMode, GamutType, GamutData, CustomPrimaries } from '@/types';

/** Colors for comparison displays */
const COMPARISON_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
];

interface GamutDiagramProps {
  mode: DiagramMode;
  enabledGamuts: GamutType[];
  /** Primary display gamut (single mode) */
  primaryGamut?: GamutData;
  /** Comparison gamuts (multi-compare mode) */
  comparisonGamuts?: GamutData[];
  width?: number;
  height?: number;
}

export default function GamutDiagram({
  mode,
  enabledGamuts,
  primaryGamut,
  comparisonGamuts = [],
  width = 500,
  height = 500,
}: GamutDiagramProps) {
  // Build custom primaries array for CIEDiagram
  const customPrimaries: CustomPrimaries[] = useMemo(() => {
    const result: CustomPrimaries[] = [];

    if (primaryGamut) {
      result.push({
        name: primaryGamut.name,
        primaries: primaryGamut.primaries,
        color: COMPARISON_COLORS[0],
      });
    }

    comparisonGamuts.forEach((g, i) => {
      result.push({
        name: g.name,
        primaries: g.primaries,
        color: COMPARISON_COLORS[(i + 1) % COMPARISON_COLORS.length],
      });
    });

    return result;
  }, [primaryGamut, comparisonGamuts]);

  return (
    <CIEDiagram
      mode={mode}
      enabledGamuts={enabledGamuts}
      customPrimaries={customPrimaries}
      width={width}
      height={height}
    />
  );
}

export { COMPARISON_COLORS };
