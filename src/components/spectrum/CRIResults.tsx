/**
 * CRI Results Component
 *
 * Displays:
 * - CRI Ra gauge (large prominent display)
 * - R1-R14 individual scores as horizontal bar chart
 * - Reference illuminant info
 */

import type { CRIResult } from '@/lib/cri';
import { TCS_SHORT_LABELS } from '@/lib/cri';
import { useTranslation } from '@/lib/i18n';

interface CRIResultsProps {
  result: CRIResult | null;
}

function getRatingColor(value: number): string {
  if (value >= 90) return 'text-green-600 dark:text-green-400';
  if (value >= 80) return 'text-blue-600 dark:text-blue-400';
  if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getBarColor(value: number): string {
  if (value >= 90) return 'bg-green-500';
  if (value >= 80) return 'bg-blue-500';
  if (value >= 60) return 'bg-yellow-500';
  if (value >= 0) return 'bg-red-500';
  return 'bg-gray-400';
}

function getBarWidth(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export default function CRIResults({ result }: CRIResultsProps) {
  const { t } = useTranslation();

  const getRatingLabel = (value: number): string => {
    if (value >= 90) return t('cri.excellent');
    if (value >= 80) return t('cri.good');
    if (value >= 60) return t('cri.fair');
    return t('cri.poor');
  };

  if (!result) {
    return (
      <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('cri.criTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('cri.criEmpty')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {t('cri.criTitle')}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('cri.criReference')} {result.referenceType === 'planckian' ? t('cri.criPlanckian') : t('cri.criDSeries')} {t('cri.criAt')} {result.cct}K
      </p>

      {/* Ra Gauge */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cri.generalCri')}</p>
          <p className={`text-4xl font-bold ${getRatingColor(result.Ra)}`}>
            {result.Ra.toFixed(1)}
          </p>
          <p className={`text-sm mt-1 ${getRatingColor(result.Ra)}`}>
            {getRatingLabel(result.Ra)}
          </p>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(result.Ra)}`}
              style={{ width: `${getBarWidth(result.Ra)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* R1-R14 Bar Chart */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('cri.individualScores')}</p>
        {result.Ri.map((ri, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-8 text-right">
              {TCS_SHORT_LABELS[idx]}
            </span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-300 ${getBarColor(ri)}`}
                style={{ width: `${getBarWidth(ri)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-10 text-right">
              {ri.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Key scores highlight */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.r9Red')}</p>
          <p className={`text-lg font-semibold ${getRatingColor(result.Ri[8])}`}>
            {result.Ri[8].toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.r13Skin')}</p>
          <p className={`text-lg font-semibold ${getRatingColor(result.Ri[12])}`}>
            {result.Ri[12].toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.r14Leaf')}</p>
          <p className={`text-lg font-semibold ${getRatingColor(result.Ri[13])}`}>
            {result.Ri[13].toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
