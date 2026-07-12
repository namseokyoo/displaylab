/**
 * Light Quality Dashboard Component
 *
 * Displays the currently available light-quality estimate.
 */

import { useMemo } from 'react';
import type { SpectrumPoint } from '@/types';
import { calculateCRI } from '@/lib/cri';
import type { CRIResult } from '@/lib/cri';
import { useTranslation } from '@/lib/i18n';
import CRIResults from './CRIResults';

interface LightQualityDashboardProps {
  spectrumData: SpectrumPoint[];
}

export default function LightQualityDashboard({ spectrumData }: LightQualityDashboardProps) {
  const { t } = useTranslation();

  const criResult: CRIResult | null = useMemo(() => {
    if (spectrumData.length < 10) return null;
    try {
      return calculateCRI(spectrumData);
    } catch {
      return null;
    }
  }, [spectrumData]);

  if (spectrumData.length < 10) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('cri.lightQualityTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('cri.lightQualityDesc')}</p>

        <div className="mb-4 border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">{t('cri.experimentalStatus')}</p>
          <p className="mt-0.5 text-xs">{t('cri.experimentalStatusDesc')}</p>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('cri.noDecisionUse')}</p>
      </div>

      <CRIResults result={criResult} />
    </div>
  );
}
