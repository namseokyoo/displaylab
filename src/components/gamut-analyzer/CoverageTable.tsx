/**
 * CoverageTable Component
 *
 * Shows gamut coverage percentages against all standard gamuts.
 * Displays both CIE 1931 and CIE 1976 values.
 */

import { useMemo } from 'react';
import { calculateAllCoverages, calculateGamutAreaXY, calculateGamutAreaUV } from '@/lib/gamut';
import type { GamutData, DiagramMode } from '@/types';
import type { CoverageEntry } from '@/lib/gamut';

interface CoverageTableProps {
  gamutData: GamutData;
  mode: DiagramMode;
  /** If true, show both CIE 1931 and 1976 columns. Otherwise show only active mode. */
  showBothModes?: boolean;
}

function formatPercent(val: number): string {
  return val.toFixed(1) + '%';
}

function formatArea(val: number): string {
  return val.toFixed(6);
}

function getCoverageColor(percent: number): string {
  if (percent >= 100) return 'text-green-400';
  if (percent >= 90) return 'text-emerald-400';
  if (percent >= 70) return 'text-yellow-400';
  if (percent >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export default function CoverageTable({
  gamutData,
  mode,
  showBothModes = true,
}: CoverageTableProps) {
  const coverages: CoverageEntry[] = useMemo(
    () => calculateAllCoverages(gamutData.primaries),
    [gamutData.primaries],
  );

  const customAreaXY = useMemo(
    () => calculateGamutAreaXY(gamutData.primaries),
    [gamutData.primaries],
  );
  const customAreaUV = useMemo(
    () => calculateGamutAreaUV(gamutData.primaries),
    [gamutData.primaries],
  );

  return (
    <div className="space-y-3">
      {/* Custom gamut area summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Gamut Area:</span>
        {(showBothModes || mode === 'CIE1931') && (
          <span className="text-gray-700 dark:text-gray-300 font-mono">
            <span className="text-gray-400 dark:text-gray-500 text-xs">xy: </span>
            {formatArea(customAreaXY)}
          </span>
        )}
        {(showBothModes || mode === 'CIE1976') && (
          <span className="text-gray-700 dark:text-gray-300 font-mono">
            <span className="text-gray-400 dark:text-gray-500 text-xs">u&apos;v&apos;: </span>
            {formatArea(customAreaUV)}
          </span>
        )}
      </div>

      {/* Coverage table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Standard</th>
              {(showBothModes || mode === 'CIE1931') && (
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                  CIE 1931
                </th>
              )}
              {(showBothModes || mode === 'CIE1976') && (
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                  CIE 1976
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {coverages.map((entry) => (
              <tr key={entry.standardName} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{entry.standardName}</td>
                {(showBothModes || mode === 'CIE1931') && (
                  <td className={`py-1.5 px-2 text-right font-mono ${getCoverageColor(entry.coverageXY)}`}>
                    {formatPercent(entry.coverageXY)}
                  </td>
                )}
                {(showBothModes || mode === 'CIE1976') && (
                  <td className={`py-1.5 px-2 text-right font-mono ${getCoverageColor(entry.coverageUV)}`}>
                    {formatPercent(entry.coverageUV)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600">
        * Area ratio method. Intersection-based coverage in Phase 2.
      </p>
    </div>
  );
}
