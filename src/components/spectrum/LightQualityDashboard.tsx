/**
 * Light Quality Dashboard Component
 *
 * Integrates CRI, TLCI, and TM-30 results into a unified dashboard
 * displayed below the existing Spectrum Analyzer results.
 */

import { useMemo, useRef, useState, useEffect } from 'react';
import type { SpectrumPoint } from '@/types';
import { calculateCRI, calculateTLCI, calculateTM30, LIGHT_QUALITY_VALIDATION } from '@/lib/cri';
import type { CRIResult, TLCIResult, TM30Result } from '@/lib/cri';
import { useTranslation } from '@/lib/i18n';
import CRIResults from './CRIResults';
import TM30VectorGraphic from './TM30VectorGraphic';

interface LightQualityDashboardProps {
  spectrumData: SpectrumPoint[];
}

type TabKey = 'cri' | 'tm30' | 'tlci';

function MetricCard({
  label,
  value,
  suffix,
  description,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  description?: string;
}) {
  const displayValue = value !== null ? value.toFixed(1) : '--';

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/60 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${value !== null ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
        {displayValue}
        {value !== null && suffix && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-0.5">{suffix}</span>
        )}
      </p>
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
  );
}

export default function LightQualityDashboard({ spectrumData }: LightQualityDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('cri');
  const vectorContainerRef = useRef<HTMLDivElement>(null);
  const [vectorSize, setVectorSize] = useState(350);

  // Calculate all metrics
  const criResult: CRIResult | null = useMemo(() => {
    if (spectrumData.length < 10) return null;
    try {
      return calculateCRI(spectrumData);
    } catch {
      return null;
    }
  }, [spectrumData]);

  const tlciResult: TLCIResult | null = useMemo(() => {
    if (spectrumData.length < 10) return null;
    try {
      return calculateTLCI(spectrumData);
    } catch {
      return null;
    }
  }, [spectrumData]);

  const tm30Result: TM30Result | null = useMemo(() => {
    if (spectrumData.length < 10) return null;
    try {
      return calculateTM30(spectrumData);
    } catch {
      return null;
    }
  }, [spectrumData]);

  // Responsive vector graphic size
  useEffect(() => {
    const container = vectorContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setVectorSize(Math.max(250, Math.min(450, w - 32)));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (spectrumData.length < 10) {
    return null;
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'cri', label: 'CRI' },
    { key: 'tm30', label: 'TM-30' },
    { key: 'tlci', label: 'TLCI' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('cri.lightQualityTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('cri.lightQualityDesc')}
        </p>

        <div className="mb-4 border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">{t('cri.experimentalStatus')}</p>
          <p className="mt-0.5 text-xs">{t('cri.experimentalStatusDesc')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label={t('cri.criRa')}
            value={criResult?.Ra ?? null}
            description={t('cri.generalCri')}
          />
          <MetricCard
            label={t('cri.tm30Rf')}
            value={tm30Result?.Rf ?? null}
            description={t('cri.fidelityIndex')}
          />
          <MetricCard
            label={t('cri.tm30Rg')}
            value={tm30Result?.Rg ?? null}
            description={t('cri.gamutIndex')}
          />
          <MetricCard
            label={t('cri.tlciQa')}
            value={tlciResult?.Qa ?? null}
            description={t('cri.tvLighting')}
          />
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {Object.values(LIGHT_QUALITY_VALIDATION).every((item) => item.status === 'experimental')
            ? t('cri.noDecisionUse')
            : null}
        </p>
      </div>

      {/* Tabbed Detail View */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CRI Tab */}
        {activeTab === 'cri' && <CRIResults result={criResult} />}

        {/* TM-30 Tab */}
        {activeTab === 'tm30' && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t('cri.tm30Title')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('cri.tm30Desc')}
              </p>

              <div ref={vectorContainerRef} className="flex justify-center">
                <TM30VectorGraphic
                  result={tm30Result}
                  width={vectorSize}
                  height={vectorSize}
                />
              </div>

              {tm30Result && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.fidelity')}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tm30Result.Rf.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t('cri.experimentalEstimate')}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.gamut')}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tm30Result.Rg.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t('cri.experimentalEstimate')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TLCI Tab */}
        {activeTab === 'tlci' && (
          <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('cri.tlciTitle')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('cri.tlciDesc')}
            </p>

            {!tlciResult ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('cri.tlciEmpty')}
              </p>
            ) : (
              <>
                {/* TLCI Score */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cri.tlciScore')}</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {tlciResult.Qa.toFixed(1)}
                    </p>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{t('cri.experimentalEstimate')}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-500 transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, tlciResult.Qa))}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">{t('cri.noDecisionUse')}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
