/**
 * Viewing Angle Data Table Component
 *
 * Displays parsed + computed viewing angle data in a responsive table.
 * Includes CSV export button.
 */

import type { ViewingAngleData } from '@/types';
import { exportViewingAngleCSV } from '@/lib/viewing-angle';
import { useTranslation } from '@/lib/i18n';

interface DataTableProps {
  data: ViewingAngleData[];
}

function formatNum(val: number | undefined, decimals: number): string {
  if (val === undefined || val === null) return '-';
  return val.toFixed(decimals);
}

/** Get color class based on ΔE value */
function getDeltaEColor(de: number | undefined): string {
  if (de === undefined) return 'text-gray-400';
  if (de < 1) return 'text-green-400';
  if (de < 3) return 'text-yellow-400';
  return 'text-red-400';
}

export default function DataTable({ data }: DataTableProps) {
  const { t } = useTranslation();
  const handleExport = () => {
    const csv = exportViewingAngleCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'viewing-angle-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('viewing.measurementData')}</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('common.exportCsv')}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs">
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colAngle')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colLuminance')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colCieX')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colCieY')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colDeltaEab')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colDeltaE00')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('viewing.colCR')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr
                key={d.angle}
                className={`border-t border-gray-100 dark:border-gray-800/50 ${
                  i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
                }`}
              >
                <td className="px-3 py-1.5 text-right text-gray-700 dark:text-gray-300 font-mono">
                  {d.angle}&deg;
                </td>
                <td className="px-3 py-1.5 text-right text-gray-700 dark:text-gray-300 font-mono">
                  {formatNum(d.luminance, 1)}
                </td>
                <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400 font-mono">
                  {formatNum(d.cieX, 4)}
                </td>
                <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400 font-mono">
                  {formatNum(d.cieY, 4)}
                </td>
                <td className={`px-3 py-1.5 text-right font-mono ${getDeltaEColor(d.deltaE_ab)}`}>
                  {formatNum(d.deltaE_ab, 2)}
                </td>
                <td className={`px-3 py-1.5 text-right font-mono ${getDeltaEColor(d.deltaE_2000)}`}>
                  {formatNum(d.deltaE_2000, 2)}
                </td>
                <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400 font-mono">
                  {d.contrastRatio !== undefined
                    ? `${(d.contrastRatio * 100).toFixed(1)}%`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
