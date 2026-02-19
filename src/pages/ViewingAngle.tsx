/**
 * Viewing Angle Analyzer Page
 *
 * Full viewing angle analysis tool:
 * - CSV upload / preset selection
 * - Data table with computed ΔE and contrast ratio
 * - Polar plot (angular luminance)
 * - CIE color shift trajectory
 * - ΔE heatmap with JND threshold
 * - OLED vs LCD comparison mode
 * - Responsive layout (mobile: vertical, desktop: 2-column)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import CSVUploader from '@/components/common/CSVUploader';
import PolarPlot from '@/components/viewing-angle/PolarPlot';
import ColorShiftTrack from '@/components/viewing-angle/ColorShiftTrack';
import DeltaEHeatmap from '@/components/viewing-angle/DeltaEHeatmap';
import DataTable from '@/components/viewing-angle/DataTable';
import SEO from '@/components/common/SEO';
import { toolJsonLd } from '@/lib/seo-data';
import {
  parseViewingAngleRows,
  parseViewingAngleCSV,
  computeViewingAngleMetrics,
} from '@/lib/viewing-angle';
import type { ViewingAngleData } from '@/types';
import type { ParsedRow } from '@/lib/csv-parser';

type PresetType = 'none' | 'oled' | 'lcd';

/** SVG to PNG download helper */
function downloadSvgAsPng(svgElement: SVGSVGElement | null, filename: string) {
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width * 2; // 2x for retina
    canvas.height = img.height * 2;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };
  img.src = url;
}

export default function ViewingAngle() {
  const [data, setData] = useState<ViewingAngleData[]>([]);
  const [comparisonData, setComparisonData] = useState<ViewingAngleData[]>([]);
  const [activePreset, setActivePreset] = useState<PresetType>('none');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLabel, setDataLabel] = useState('Custom');
  const [comparisonLabel, setComparisonLabel] = useState('');

  // Refs for SVG download
  const polarRef = useRef<HTMLDivElement>(null);
  const colorShiftRef = useRef<HTMLDivElement>(null);
  const deltaERef = useRef<HTMLDivElement>(null);

  // Responsive chart sizing
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState(450);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const size = Math.max(300, Math.min(550, w - 16));
        setChartSize(size);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Load preset CSV
  const loadPreset = useCallback(
    async (type: PresetType) => {
      if (type === 'none') {
        if (!comparisonMode) {
          setData([]);
          setActivePreset('none');
          setDataLabel('Custom');
        }
        return;
      }

      setLoading(true);
      try {
        const fileName =
          type === 'oled' ? 'viewing-angle-oled.csv' : 'viewing-angle-lcd.csv';
        const response = await fetch(`/presets/${fileName}`);
        if (!response.ok) throw new Error('Failed to load preset');

        const text = await response.text();
        // Guard: reject HTML responses (e.g. SPA fallback returning index.html)
        if (text.trimStart().startsWith('<!')) {
          throw new Error('Received HTML instead of CSV');
        }

        const parsed = parseViewingAngleCSV(text);
        const computed = computeViewingAngleMetrics(parsed);

        if (comparisonMode && data.length > 0) {
          setComparisonData(computed);
          setComparisonLabel(type === 'oled' ? 'OLED' : 'LCD (IPS)');
        } else {
          setData(computed);
          setDataLabel(type === 'oled' ? 'OLED' : 'LCD (IPS)');
          setActivePreset(type);
        }
      } catch (err) {
        console.error('Failed to load preset:', err);
      } finally {
        setLoading(false);
      }
    },
    [comparisonMode, data.length],
  );

  // Handle CSV upload
  const handleCSVLoaded = useCallback(
    (rows: ParsedRow[]) => {
      try {
        const parsed = parseViewingAngleRows(rows);
        const computed = computeViewingAngleMetrics(parsed);

        if (comparisonMode && data.length > 0) {
          setComparisonData(computed);
          setComparisonLabel('Uploaded');
        } else {
          setData(computed);
          setDataLabel('Custom');
          setActivePreset('none');
        }
      } catch (err) {
        console.error('Failed to parse CSV:', err);
      }
    },
    [comparisonMode, data.length],
  );

  // Comparison mode toggle
  const handleComparisonToggle = useCallback(() => {
    if (comparisonMode) {
      setComparisonData([]);
      setComparisonLabel('');
    }
    setComparisonMode((prev) => !prev);
  }, [comparisonMode]);

  // Quick comparison: OLED vs LCD
  const handleQuickCompare = useCallback(async () => {
    setLoading(true);
    try {
      const loadCSV = async (fileName: string) => {
        const res = await fetch(`/presets/${fileName}`);
        if (!res.ok) throw new Error(`Failed to load ${fileName}`);
        const text = await res.text();
        // Guard: reject HTML responses (e.g. SPA fallback returning index.html)
        if (text.trimStart().startsWith('<!')) {
          throw new Error(`Received HTML instead of CSV for ${fileName}`);
        }
        return text;
      };

      const [oledText, lcdText] = await Promise.all([
        loadCSV('viewing-angle-oled.csv'),
        loadCSV('viewing-angle-lcd.csv'),
      ]);

      const oledData = computeViewingAngleMetrics(parseViewingAngleCSV(oledText));
      const lcdData = computeViewingAngleMetrics(parseViewingAngleCSV(lcdText));

      setData(oledData);
      setDataLabel('OLED');
      setComparisonData(lcdData);
      setComparisonLabel('LCD (IPS)');
      setComparisonMode(true);
      setActivePreset('oled');
    } catch (err) {
      console.error('Failed to load comparison data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadSvg = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      const svg = ref.current?.querySelector('svg') as SVGSVGElement | null;
      downloadSvgAsPng(svg, filename);
    },
    [],
  );

  const hasData = data.length > 0;
  const hasComparison = comparisonData.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      <SEO
        title="Viewing Angle Analyzer - Display Lab"
        description="Upload goniometer CSV data to visualize display viewing angle performance: polar plots, color shift tracking, and Delta E heatmaps."
        keywords="viewing angle analyzer, goniometer data, display viewing angle, polar plot, color shift, delta E heatmap, OLED viewing angle"
        path="/viewing-angle"
        jsonLd={toolJsonLd(
          'Viewing Angle Analyzer',
          'Upload goniometer CSV data to visualize display viewing angle performance with polar plots and Delta E heatmaps.',
          '/viewing-angle',
        )}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Viewing Angle Analyzer</h1>
        <p className="text-gray-400 text-sm">
          Upload goniometer CSV data or select a preset to analyze display viewing angle
          performance. Visualize angular luminance, color shift trajectory, and Delta E
          distribution.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Upload + Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CSV Upload */}
          <div>
            <CSVUploader
              onDataLoaded={handleCSVLoaded}
              expectedColumns={['angle', 'luminance', 'cieX', 'cieY']}
            />
          </div>

          {/* Preset & Actions */}
          <div className="space-y-3">
            {/* Presets */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Presets</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => loadPreset('oled')}
                  disabled={loading}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    activePreset === 'oled' && !comparisonMode
                      ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  OLED
                </button>
                <button
                  onClick={() => loadPreset('lcd')}
                  disabled={loading}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    activePreset === 'lcd' && !comparisonMode
                      ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  LCD (IPS)
                </button>
                <button
                  onClick={handleQuickCompare}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg border border-amber-700/50 text-amber-400 hover:border-amber-500 transition-colors"
                >
                  OLED vs LCD
                </button>
              </div>
            </div>

            {/* Template download */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Template</label>
              <a
                href="/templates/viewing-angle-template.csv"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download CSV Template
              </a>
            </div>

            {/* Comparison toggle */}
            {hasData && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Comparison</label>
                <button
                  onClick={handleComparisonToggle}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    comparisonMode
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {comparisonMode ? 'Exit Comparison' : 'Compare Mode'}
                </button>
                {comparisonMode && !hasComparison && (
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a second CSV or select a preset to compare.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 mt-2">Loading preset data...</p>
        </div>
      )}

      {/* Results */}
      {hasData && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={chartContainerRef}>
          {/* Left column: Charts */}
          <div className="space-y-6">
            {/* Polar Plot */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-300">Polar Plot</h2>
                <button
                  onClick={() => handleDownloadSvg(polarRef, 'polar-plot.png')}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  title="Download as PNG"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              <div ref={polarRef} className="flex justify-center">
                <PolarPlot
                  data={data}
                  comparisonData={hasComparison ? comparisonData : undefined}
                  dataLabel={dataLabel}
                  comparisonLabel={comparisonLabel}
                  width={chartSize}
                  height={chartSize}
                />
              </div>
            </div>

            {/* Color Shift */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-300">Color Shift Trajectory</h2>
                <button
                  onClick={() => handleDownloadSvg(colorShiftRef, 'color-shift.png')}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  title="Download as PNG"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              <div ref={colorShiftRef} className="flex justify-center">
                <ColorShiftTrack
                  data={data}
                  comparisonData={hasComparison ? comparisonData : undefined}
                  dataLabel={dataLabel}
                  comparisonLabel={comparisonLabel}
                  width={chartSize}
                  height={chartSize}
                />
              </div>
            </div>
          </div>

          {/* Right column: Table + ΔE Chart */}
          <div className="space-y-6">
            {/* Data Table */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <DataTable data={data} />
            </div>

            {/* ΔE Heatmap */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-300">Delta E Distribution</h2>
                <button
                  onClick={() => handleDownloadSvg(deltaERef, 'delta-e-heatmap.png')}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  title="Download as PNG"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              <div ref={deltaERef}>
                <DeltaEHeatmap
                  data={data}
                  comparisonData={hasComparison ? comparisonData : undefined}
                  dataLabel={dataLabel}
                  comparisonLabel={comparisonLabel}
                  width={chartSize}
                  height={320}
                />
              </div>
            </div>

            {/* Comparison Data Table */}
            {hasComparison && (
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                <h3 className="text-sm font-medium text-amber-400 mb-3">
                  {comparisonLabel} Data
                </h3>
                <DataTable data={comparisonData} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && !loading && (
        <div className="p-8 rounded-xl bg-gray-900 border border-gray-800 text-center mt-4">
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Upload a CSV file with viewing angle measurement data, or select a preset above
            to get started. The CSV should contain columns:{' '}
            <code className="text-blue-400">angle, luminance, cieX, cieY</code>
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-sm font-medium text-gray-300">Polar Plot</div>
              <div className="text-xs text-gray-500">Angular luminance</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-sm font-medium text-gray-300">Color Shift</div>
              <div className="text-xs text-gray-500">CIE trajectory</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-sm font-medium text-gray-300">Delta E Map</div>
              <div className="text-xs text-gray-500">Angle heatmap</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
