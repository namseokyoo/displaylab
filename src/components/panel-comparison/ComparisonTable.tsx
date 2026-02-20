/**
 * Comparison Table Component
 *
 * Displays side-by-side panel scores with per-row max highlights
 * and mini progress bars for quick scanning.
 */

import { SPEC_LABELS } from '@/data/panel-technologies';
import type { PanelTechnology } from '@/data/panel-technologies';

interface ComparisonTableProps {
  panels: PanelTechnology[];
}

export default function ComparisonTable({ panels }: ComparisonTableProps) {
  if (panels.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Select at least one panel technology to show comparison data.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Spec</th>
            {panels.map((panel) => (
              <th key={panel.id} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: panel.color }} />
                  {panel.shortName}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SPEC_LABELS.map((spec) => {
            const maxScore = Math.max(...panels.map((panel) => panel.specs[spec.key]));

            return (
              <tr key={spec.key} className="border-b last:border-0 border-gray-100 dark:border-gray-700/60">
                <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{spec.label}</td>
                {panels.map((panel) => {
                  const score = panel.specs[spec.key];
                  const isBest = score === maxScore;

                  return (
                    <td key={`${spec.key}-${panel.id}`} className="px-4 py-3">
                      <div className={isBest ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>
                        {score}
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(score / 10) * 100}%`, backgroundColor: panel.color }}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
