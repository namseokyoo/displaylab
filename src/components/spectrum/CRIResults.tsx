/**
 * CRI Results Component
 *
 * Displays:
 * - CRI Ra gauge (large prominent display)
 * - Reference illuminant info
 */

import type { CRIResult } from '@/lib/cri';
import { useTranslation } from '@/lib/i18n';

interface CRIResultsProps {
  result: CRIResult | null;
}

function getBarWidth(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export default function CRIResults({ result }: CRIResultsProps) {
  const { t } = useTranslation();

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
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {result.Ra.toFixed(1)}
          </p>
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{t('cri.experimentalEstimate')}</p>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gray-500 transition-all duration-500"
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

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('cri.raOnlyNotice')}
      </p>
    </div>
  );
}
