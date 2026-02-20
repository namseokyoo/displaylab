import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CIEDiagram from '@/components/common/CIEDiagram';
import SEO from '@/components/common/SEO';
import ShareButton from '@/components/common/ShareButton';
import SpectrumChart from '@/components/spectrum/SpectrumChart';
import SpectrumDataInput from '@/components/spectrum/SpectrumDataInput';
import LightQualityDashboard from '@/components/spectrum/LightQualityDashboard';
import SpectrumResults from '@/components/spectrum/SpectrumResults';
import { SPECTRAL_LOCUS_XY } from '@/data/cie1931';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslation } from '@/lib/i18n';
import { toolJsonLd } from '@/lib/seo-data';
import { analyzeSpectrum, calculateChromaticity } from '@/lib/spectrum';
import type { DiagramMarker, DiagramMode, SpectrumPoint } from '@/types';

function interpolateLocusPoint(wavelength: number): { x: number; y: number } | null {
  if (SPECTRAL_LOCUS_XY.length === 0) return null;

  if (wavelength <= SPECTRAL_LOCUS_XY[0].wavelength) {
    return { x: SPECTRAL_LOCUS_XY[0].x, y: SPECTRAL_LOCUS_XY[0].y };
  }

  const last = SPECTRAL_LOCUS_XY[SPECTRAL_LOCUS_XY.length - 1];
  if (wavelength >= last.wavelength) {
    return { x: last.x, y: last.y };
  }

  for (let i = 0; i < SPECTRAL_LOCUS_XY.length - 1; i++) {
    const left = SPECTRAL_LOCUS_XY[i];
    const right = SPECTRAL_LOCUS_XY[i + 1];
    if (wavelength < left.wavelength || wavelength > right.wavelength) continue;

    const t = (wavelength - left.wavelength) / (right.wavelength - left.wavelength);
    return {
      x: left.x + (right.x - left.x) * t,
      y: left.y + (right.y - left.y) * t,
    };
  }

  return null;
}

function calculateExcitationPurity(
  x: number,
  y: number,
  dominantWavelength: number,
): number | undefined {
  const spectralPoint = interpolateLocusPoint(dominantWavelength);
  if (!spectralPoint) return undefined;

  const white = { x: 0.3127, y: 0.3290 };
  const sampleDistance = Math.hypot(x - white.x, y - white.y);
  const spectralDistance = Math.hypot(spectralPoint.x - white.x, spectralPoint.y - white.y);
  if (spectralDistance === 0) return undefined;

  return Math.max(0, Math.min(1, sampleDistance / spectralDistance));
}

export default function SpectrumAnalyzer() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<DiagramMode>('CIE1931');
  const [spectrumData, setSpectrumData] = useLocalStorage<SpectrumPoint[]>(
    'displaylab::spectrum::lastData',
    [],
  );
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [diagramSize, setDiagramSize] = useState(500);

  useEffect(() => {
    const container = diagramContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const size = Math.max(280, Math.min(600, width - 16));
        setDiagramSize(size);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleDataLoaded = useCallback(
    (data: SpectrumPoint[]) => {
      setSpectrumData(data);
    },
    [setSpectrumData],
  );

  const chromaticity = useMemo(() => {
    if (spectrumData.length === 0) return null;
    return calculateChromaticity(spectrumData);
  }, [spectrumData]);

  const analysis = useMemo(() => {
    if (spectrumData.length === 0) return null;
    return analyzeSpectrum(spectrumData);
  }, [spectrumData]);

  const purity = useMemo(() => {
    if (!chromaticity) return undefined;
    return calculateExcitationPurity(
      chromaticity.cie1931.x,
      chromaticity.cie1931.y,
      chromaticity.dominantWavelength,
    );
  }, [chromaticity]);

  const markers = useMemo<DiagramMarker[]>(() => {
    if (!chromaticity) return [];
    return [
      {
        x: chromaticity.cie1931.x,
        y: chromaticity.cie1931.y,
        color: '#3b82f6',
        label: 'Measured',
      },
    ];
  }, [chromaticity]);

  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);

    if (chromaticity) {
      params.set('x', chromaticity.cie1931.x.toFixed(4));
      params.set('y', chromaticity.cie1931.y.toFixed(4));
      params.set('cct', chromaticity.cct.toFixed(0));
      params.set('duv', chromaticity.duv.toFixed(4));
      params.set('dw', chromaticity.dominantWavelength.toFixed(1));
      params.set('hex', chromaticity.hexColor);
      if (typeof purity === 'number') {
        params.set('purity', (purity * 100).toFixed(1));
      }
    }

    if (analysis) {
      params.set('peak', analysis.peakWavelength.toFixed(1));
      if (analysis.fwhm !== null) {
        params.set('fwhm', analysis.fwhm.toFixed(1));
      }
    }

    if (spectrumData.length > 0) {
      params.set('samples', String(spectrumData.length));
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [analysis, chromaticity, mode, purity, spectrumData.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t('spectrum.seoTitle')}
        description={t('spectrum.seoDesc')}
        keywords="spectrum analyzer, SPD analysis, CIE chromaticity, CCT, Duv, FWHM, emission spectrum, CIE diagram"
        path="/spectrum-analyzer"
        jsonLd={toolJsonLd(
          'Spectrum Analyzer',
          'Analyze emission spectra (SPD): calculate CIE chromaticity, CCT, Duv, FWHM, and visualize on CIE diagram.',
          '/spectrum-analyzer',
        )}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('spectrum.title')}</h1>
          <ShareButton getShareUrl={getShareUrl} />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {t('spectrum.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <SpectrumDataInput onDataLoaded={handleDataLoaded} />
          <SpectrumResults
            cct={chromaticity?.cct}
            duv={chromaticity?.duv}
            dominantWavelength={chromaticity?.dominantWavelength}
            purity={purity}
            peakWavelength={analysis?.peakWavelength}
            fwhm={analysis?.fwhm ?? undefined}
            hexColor={chromaticity?.hexColor}
          />
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('spectrum.spectrumChart')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('spectrum.spectrumChartDesc')}
            </p>
            <SpectrumChart data={spectrumData} peakWavelength={analysis?.peakWavelength} />
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('spectrum.cieDiagram')}</h2>
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
            </div>
            <div ref={diagramContainerRef} className="flex justify-center lg:justify-start">
              <CIEDiagram mode={mode} markers={markers} width={diagramSize} height={diagramSize} />
            </div>
          </div>
        </div>
      </div>

      {/* Light Quality Metrics (CRI / TM-30 / TLCI) */}
      {spectrumData.length >= 10 && (
        <div className="mt-8">
          <LightQualityDashboard spectrumData={spectrumData} />
        </div>
      )}
    </div>
  );
}
