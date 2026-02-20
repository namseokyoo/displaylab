import type { HDRAnalysisResult } from '@/lib/hdr';
import { useTranslation } from '@/lib/i18n';

interface HDRAnalysisResultsProps {
  result: HDRAnalysisResult | null;
}

function getPeakScoreBadgeClass(score: string): string {
  switch (score) {
    case 'Basic SDR':
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    case 'HDR Entry':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800/60';
    case 'HDR Standard':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60';
    case 'HDR Premium':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/60';
    case 'HDR Reference':
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/60';
    case 'HDR Mastering':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/60';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
}

function getHDRGradeBadgeClass(grade: string): string {
  switch (grade) {
    case 'Premium':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/60';
    case 'Standard':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700/60 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p> : null}
    </div>
  );
}

export default function HDRAnalysisResults({ result }: HDRAnalysisResultsProps) {
  const { t } = useTranslation();

  if (!result) {
    return (
      <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('hdr.resultsTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('hdr.resultsEmpty')}
        </p>
      </div>
    );
  }

  const ratioValue =
    result.maxCLLToMaxFALLRatio > 0 && Number.isFinite(result.maxCLLToMaxFALLRatio)
      ? `${result.maxCLLToMaxFALLRatio.toFixed(2)} : 1`
      : '--';

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {t('hdr.resultsTitle')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('hdr.resultsDesc')}
      </p>

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">{t('hdr.peakBrightnessScore')}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getPeakScoreBadgeClass(result.peakBrightnessScore.score)}`}
          >
            {result.peakBrightnessScore.score}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {result.peakBrightnessScore.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">{t('hdr.hdr10Compatibility')}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getHDRGradeBadgeClass(result.hdr10Grade)}`}
          >
            {result.hdr10Grade}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label={t('hdr.dynamicRange')}
          value={`${result.dynamicRange.toFixed(2)} stops`}
          helper={t('hdr.dynamicRangeHelper')}
        />
        <MetricCard label={t('hdr.maxCLLvsMaxFALL')} value={ratioValue} />
        <MetricCard label={t('hdr.bt2020Coverage')} value={`${result.gamutCoverage.toFixed(1)}%`} />
        <MetricCard label={t('hdr.hdr10Grade')} value={result.hdr10Grade} />
      </div>
    </div>
  );
}
