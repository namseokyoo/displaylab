/**
 * Gamut Analyzer Page
 *
 * Full color gamut analysis tool:
 * - Custom primaries input with presets
 * - CIE 1931/1976 diagram with standard gamut overlays
 * - Coverage % table
 * - Up to 4 display comparison
 * - Responsive layout (mobile: vertical, desktop: 2-column)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import GamutDiagram from '@/components/gamut-analyzer/GamutDiagram';
import ComparisonPanel from '@/components/gamut-analyzer/ComparisonPanel';
import ShareButton from '@/components/common/ShareButton';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import SEO from '@/components/common/SEO';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslation } from '@/lib/i18n';
import { encodeGamutState, decodeGamutState } from '@/lib/url-share';
import { toolJsonLd } from '@/lib/seo-data';
import type { DiagramMode, GamutType, GamutData } from '@/types';

const GAMUT_OPTIONS: GamutType[] = ['sRGB', 'DCI-P3', 'BT.2020', 'AdobeRGB', 'NTSC'];

const GAMUT_TOGGLE_COLORS: Record<string, string> = {
  sRGB: 'border-white/50 text-white',
  'DCI-P3': 'border-green-500/50 text-green-400',
  'BT.2020': 'border-amber-500/50 text-amber-400',
  AdobeRGB: 'border-purple-500/50 text-purple-400',
  NTSC: 'border-red-500/50 text-red-400',
};

const GAMUT_TOGGLE_ACTIVE: Record<string, string> = {
  sRGB: 'bg-white/10 border-white/60 text-white',
  'DCI-P3': 'bg-green-500/10 border-green-500/60 text-green-400',
  'BT.2020': 'bg-amber-500/10 border-amber-500/60 text-amber-400',
  AdobeRGB: 'bg-purple-500/10 border-purple-500/60 text-purple-400',
  NTSC: 'bg-red-500/10 border-red-500/60 text-red-400',
};

export default function GamutAnalyzer() {
  const { t } = useTranslation();
  const [mode, setMode] = useLocalStorage<DiagramMode>('displaylab::gamut::mode', 'CIE1931');
  const [enabledGamuts, setEnabledGamuts] = useLocalStorage<GamutType[]>(
    'displaylab::gamut::standards',
    ['sRGB'],
  );
  const [activeDisplayIndex, setActiveDisplayIndex] = useState(0);
  const [displays, setDisplays] = useLocalStorage<GamutData[]>('displaylab::gamut::displays', [
    {
      name: 'My Display',
      primaries: { ...STANDARD_GAMUTS.sRGB.primaries },
    },
  ]);

  // URL param restoration (one-time on mount)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRestored = useRef(false);

  useEffect(() => {
    if (urlRestored.current) return;
    const decoded = decodeGamutState(searchParams);
    if (decoded) {
      setDisplays(decoded.displays);
      setMode(decoded.mode);
      // Clear URL params after restore
      setSearchParams(new URLSearchParams(), { replace: true });
    }
    urlRestored.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Responsive diagram sizing
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [diagramSize, setDiagramSize] = useState(500);

  useEffect(() => {
    const container = diagramContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Diagram should be square, max 600, min 300
        const size = Math.max(300, Math.min(600, width - 16));
        setDiagramSize(size);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const toggleGamut = useCallback((gamut: GamutType) => {
    setEnabledGamuts(
      enabledGamuts.includes(gamut)
        ? enabledGamuts.filter((g) => g !== gamut)
        : [...enabledGamuts, gamut],
    );
  }, [enabledGamuts, setEnabledGamuts]);

  const getShareUrl = useCallback(() => {
    const params = encodeGamutState(displays, mode);
    return `${window.location.origin}${window.location.pathname}?${params}`;
  }, [displays, mode]);

  // Primary display is first, rest are comparison
  const primaryGamut = displays[0];
  const comparisonGamuts = displays.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 overflow-x-hidden">
      <SEO
        title={t('gamut.seoTitle')}
        description={t('gamut.seoDesc')}
        keywords="color gamut analyzer, CIE 1931, CIE 1976, sRGB coverage, DCI-P3, BT.2020, display color gamut comparison"
        path="/gamut-analyzer"
        jsonLd={toolJsonLd(
          'Color Gamut Analyzer',
          'Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards with CIE 1931 and 1976 diagrams.',
          '/gamut-analyzer',
        )}
      />
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('gamut.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          {t('gamut.subtitle')}
        </p>
      </div>

      {/* Main layout: diagram left, controls right on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-8">
        {/* Diagram section */}
        <div className="order-1" ref={diagramContainerRef}>
          {/* CIE mode toggle + standard gamut toggles */}
          <div className="mb-4 space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">
                {t('common.coordinate')}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setMode('CIE1931')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'CIE1931'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  CIE 1931 xy
                </button>
                <button
                  onClick={() => setMode('CIE1976')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'CIE1976'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  CIE 1976 u&apos;v&apos;
                </button>
              </div>
              <ShareButton getShareUrl={getShareUrl} className="ml-auto" />
            </div>

            {/* Standard gamut toggles */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">
                {t('common.standards')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GAMUT_OPTIONS.map((gamut) => (
                  <button
                    key={gamut}
                    onClick={() => toggleGamut(gamut)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors
                      ${enabledGamuts.includes(gamut)
                        ? GAMUT_TOGGLE_ACTIVE[gamut]
                        : `${GAMUT_TOGGLE_COLORS[gamut]} opacity-40 hover:opacity-70 bg-transparent`
                      }`}
                  >
                    {gamut}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CIE Diagram */}
          <div className="flex justify-center lg:justify-start">
            <GamutDiagram
              mode={mode}
              enabledGamuts={enabledGamuts}
              primaryGamut={primaryGamut}
              comparisonGamuts={comparisonGamuts}
              width={diagramSize}
              height={diagramSize}
            />
          </div>
        </div>

        {/* Controls section */}
        <div className="order-2 space-y-6">
          {/* Comparison panel with tabs */}
          <div className="bg-white/50 rounded-xl border border-gray-200 dark:bg-gray-900/30 dark:border-gray-800 p-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('gamut.displayGamuts')}</h2>
            <ComparisonPanel
              displays={displays}
              onDisplaysChange={setDisplays}
              mode={mode}
              activeIndex={activeDisplayIndex}
              onActiveIndexChange={setActiveDisplayIndex}
            />
          </div>

          {/* Info card */}
          <div className="bg-white/50 rounded-xl border border-gray-200 dark:bg-gray-900/30 dark:border-gray-800 p-4">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {t('gamut.aboutCoverage')}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {t('gamut.aboutCoverageText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
