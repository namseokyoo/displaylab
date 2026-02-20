/**
 * Light Quality Dashboard Component
 *
 * Integrates CRI, TLCI, and TM-30 results into a unified dashboard
 * displayed below the existing Spectrum Analyzer results.
 */

import { useMemo, useRef, useState, useEffect } from 'react';
import type { SpectrumPoint } from '@/types';
import { calculateCRI, calculateTLCI, calculateTM30 } from '@/lib/cri';
import type { CRIResult, TLCIResult, TM30Result } from '@/lib/cri';
import CRIResults from './CRIResults';
import TM30VectorGraphic from './TM30VectorGraphic';

interface LightQualityDashboardProps {
  spectrumData: SpectrumPoint[];
}

type TabKey = 'cri' | 'tm30' | 'tlci';

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
      <p className={`text-2xl font-bold mt-0.5 ${value !== null ? getRatingColor(value) : 'text-gray-400'}`}>
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
          Light Quality Metrics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Color rendering quality analysis based on the loaded spectrum.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="CRI Ra"
            value={criResult?.Ra ?? null}
            description="General CRI"
          />
          <MetricCard
            label="TM-30 Rf"
            value={tm30Result?.Rf ?? null}
            description="Fidelity Index"
          />
          <MetricCard
            label="TM-30 Rg"
            value={tm30Result?.Rg ?? null}
            description="Gamut Index"
          />
          <MetricCard
            label="TLCI Qa"
            value={tlciResult?.Qa ?? null}
            description="TV Lighting"
          />
        </div>

        {/* Quick interpretation */}
        {criResult && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${getBarColor(criResult.Ra)}`} />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {criResult.Ra >= 90
                  ? 'Excellent color rendering. Suitable for all applications.'
                  : criResult.Ra >= 80
                    ? 'Good color rendering. Suitable for most applications.'
                    : criResult.Ra >= 60
                      ? 'Fair color rendering. Some color distortion may be noticeable.'
                      : 'Poor color rendering. Significant color distortion expected.'}
              </p>
            </div>
          </div>
        )}
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
                IES TM-30-20 Color Vector Graphic
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                16-bin gamut comparison in CIELAB a*b* plane. Arrows show color shift from reference to test.
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fidelity (Rf)</p>
                    <p className={`text-3xl font-bold ${getRatingColor(tm30Result.Rf)}`}>
                      {tm30Result.Rf.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tm30Result.Rf >= 85 ? 'Excellent' : tm30Result.Rf >= 75 ? 'Good' : tm30Result.Rf >= 65 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/60 dark:bg-gray-800/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gamut (Rg)</p>
                    <p className={`text-3xl font-bold ${
                      tm30Result.Rg >= 95 && tm30Result.Rg <= 105
                        ? 'text-green-600 dark:text-green-400'
                        : tm30Result.Rg >= 90 && tm30Result.Rg <= 110
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {tm30Result.Rg.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tm30Result.Rg > 105 ? 'Expanded gamut' : tm30Result.Rg < 95 ? 'Reduced gamut' : 'Neutral gamut'}
                    </p>
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
              TLCI (Television Lighting Consistency Index)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Evaluates color rendering quality for broadcast camera capture.
            </p>

            {!tlciResult ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Load spectrum data to calculate TLCI.
              </p>
            ) : (
              <>
                {/* TLCI Score */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TLCI Score</p>
                    <p className={`text-4xl font-bold ${getRatingColor(tlciResult.Qa)}`}>
                      {tlciResult.Qa.toFixed(1)}
                    </p>
                    <p className={`text-sm mt-1 ${getRatingColor(tlciResult.Qa)}`}>
                      {tlciResult.Qa >= 85
                        ? 'Broadcast Ready'
                        : tlciResult.Qa >= 75
                          ? 'Acceptable'
                          : tlciResult.Qa >= 50
                            ? 'Needs Correction'
                            : 'Not Recommended'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(tlciResult.Qa)}`}
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

                {/* TLCI Interpretation Guide */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Interpretation Guide</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { range: '85-100', label: 'Excellent', desc: 'Use with confidence', color: 'bg-green-500' },
                      { range: '75-85', label: 'Good', desc: 'Minor correction may help', color: 'bg-blue-500' },
                      { range: '50-75', label: 'Fair', desc: 'Post-production correction needed', color: 'bg-yellow-500' },
                      { range: '0-50', label: 'Poor', desc: 'Not recommended for broadcast', color: 'bg-red-500' },
                    ].map((item) => (
                      <div
                        key={item.range}
                        className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700/60"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.range}: {item.label}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            &mdash; {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
