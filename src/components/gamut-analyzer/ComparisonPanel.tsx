/**
 * ComparisonPanel Component
 *
 * Manage up to 4 displays for simultaneous comparison.
 * Each display has its own name, primaries input, and coverage table.
 */

import { useCallback, useMemo } from 'react';
import PrimaryInput from '@/components/gamut-analyzer/PrimaryInput';
import CoverageTable from '@/components/gamut-analyzer/CoverageTable';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import { calculateCoverage } from '@/lib/gamut';
import type { GamutData, DiagramMode } from '@/types';

const MAX_DISPLAYS = 4;

const COMPARISON_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
];

interface ComparisonPanelProps {
  displays: GamutData[];
  onDisplaysChange: (displays: GamutData[]) => void;
  mode: DiagramMode;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

function createDefaultDisplay(index: number): GamutData {
  return {
    name: `Display ${index + 1}`,
    primaries: { ...STANDARD_GAMUTS.sRGB.primaries },
  };
}

export default function ComparisonPanel({
  displays,
  onDisplaysChange,
  mode,
  activeIndex,
  onActiveIndexChange,
}: ComparisonPanelProps) {
  const handleDisplayChange = useCallback(
    (index: number, data: GamutData) => {
      const updated = [...displays];
      updated[index] = data;
      onDisplaysChange(updated);
    },
    [displays, onDisplaysChange],
  );

  const addDisplay = useCallback(() => {
    if (displays.length >= MAX_DISPLAYS) return;
    onDisplaysChange([...displays, createDefaultDisplay(displays.length)]);
    onActiveIndexChange(displays.length);
  }, [displays, onDisplaysChange, onActiveIndexChange]);

  const removeDisplay = useCallback(
    (index: number) => {
      if (displays.length <= 1) return;
      const updated = displays.filter((_, i) => i !== index);
      onDisplaysChange(updated);
      if (activeIndex >= updated.length) {
        onActiveIndexChange(updated.length - 1);
      }
    },
    [displays, onDisplaysChange, activeIndex, onActiveIndexChange],
  );

  return (
    <div className="space-y-4">
      {/* Display tabs */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {displays.map((d, i) => (
            <div
              key={i}
              role="tab"
              tabIndex={0}
              onClick={() => onActiveIndexChange(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onActiveIndexChange(i); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer
                ${activeIndex === i
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
                }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}
              />
              <span className="truncate max-w-[120px]">{d.name || `Display ${i + 1}`}</span>
              {displays.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDisplay(i);
                  }}
                  className="ml-1 text-gray-600 hover:text-red-400 transition-colors"
                  title="Remove display"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {displays.length < MAX_DISPLAYS && (
          <button
            onClick={addDisplay}
            className="px-3 py-1.5 text-sm bg-gray-800 text-gray-400 rounded-lg
              hover:bg-gray-700 hover:text-white transition-colors shrink-0"
          >
            + Add
          </button>
        )}
      </div>

      {/* Active display input */}
      {displays[activeIndex] && (
        <div className="space-y-4">
          <PrimaryInput
            value={displays[activeIndex]}
            onChange={(data) => handleDisplayChange(activeIndex, data)}
            color={COMPARISON_COLORS[activeIndex % COMPARISON_COLORS.length]}
          />

          <CoverageTable
            gamutData={displays[activeIndex]}
            mode={mode}
          />
        </div>
      )}

      {/* Comparison summary table */}
      {displays.length > 1 && (
        <ComparisonSummary displays={displays} mode={mode} />
      )}
    </div>
  );
}

const SUMMARY_STANDARDS = ['sRGB', 'DCI-P3', 'BT.2020'] as const;

/** Side-by-side comparison summary */
function ComparisonSummary({
  displays,
  mode,
}: {
  displays: GamutData[];
  mode: DiagramMode;
}) {
  const coverageData = useMemo(() => {
    return displays.map((d) => {
      const coverages: Record<string, number> = {};
      for (const s of SUMMARY_STANDARDS) {
        const stdGamut = STANDARD_GAMUTS[s];
        if (stdGamut) {
          coverages[s] = calculateCoverage(d.primaries, stdGamut.primaries, mode);
        }
      }
      return coverages;
    });
  }, [displays, mode]);

  return (
    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
      <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
        Comparison Summary
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-1.5 px-2 text-gray-500">Display</th>
              {SUMMARY_STANDARDS.map((s) => (
                <th key={s} className="text-right py-1.5 px-2 text-gray-500">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displays.map((d, i) => (
              <tr key={i} className="border-b border-gray-800/50">
                <td className="py-1 px-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
                      }}
                    />
                    <span className="text-gray-300 truncate max-w-[100px]">
                      {d.name || `Display ${i + 1}`}
                    </span>
                  </div>
                </td>
                {SUMMARY_STANDARDS.map((s) => {
                  const coverage = coverageData[i]?.[s] ?? 0;
                  const color =
                    coverage >= 100
                      ? 'text-green-400'
                      : coverage >= 90
                        ? 'text-emerald-400'
                        : coverage >= 70
                          ? 'text-yellow-400'
                          : 'text-orange-400';
                  return (
                    <td key={s} className={`py-1 px-2 text-right font-mono ${color}`}>
                      {coverage.toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
