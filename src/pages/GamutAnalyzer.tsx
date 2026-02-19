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
import GamutDiagram from '@/components/gamut-analyzer/GamutDiagram';
import ComparisonPanel from '@/components/gamut-analyzer/ComparisonPanel';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import SEO from '@/components/common/SEO';
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
  const [mode, setMode] = useState<DiagramMode>('CIE1931');
  const [enabledGamuts, setEnabledGamuts] = useState<GamutType[]>(['sRGB']);
  const [activeDisplayIndex, setActiveDisplayIndex] = useState(0);
  const [displays, setDisplays] = useState<GamutData[]>([
    {
      name: 'My Display',
      primaries: { ...STANDARD_GAMUTS.sRGB.primaries },
    },
  ]);

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
    setEnabledGamuts((prev) =>
      prev.includes(gamut) ? prev.filter((g) => g !== gamut) : [...prev, gamut],
    );
  }, []);

  // Primary display is first, rest are comparison
  const primaryGamut = displays[0];
  const comparisonGamuts = displays.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 overflow-x-hidden">
      <SEO
        title="Color Gamut Analyzer - Display Lab"
        description="Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards. Calculate coverage percentage with CIE 1931 and 1976 diagrams."
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
        <h1 className="text-2xl font-bold text-white mb-2">Color Gamut Analyzer</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Compare display color gamuts against industry standards. Input your display
          primaries or select from device presets.
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
              <span className="text-xs text-gray-500 uppercase tracking-wider shrink-0">
                Coordinate
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setMode('CIE1931')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'CIE1931'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  CIE 1931 xy
                </button>
                <button
                  onClick={() => setMode('CIE1976')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'CIE1976'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  CIE 1976 u&apos;v&apos;
                </button>
              </div>
            </div>

            {/* Standard gamut toggles */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider shrink-0">
                Standards
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
          <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
            <h2 className="text-sm font-medium text-gray-300 mb-3">Display Gamuts</h2>
            <ComparisonPanel
              displays={displays}
              onDisplaysChange={setDisplays}
              mode={mode}
              activeIndex={activeDisplayIndex}
              onActiveIndexChange={setActiveDisplayIndex}
            />
          </div>

          {/* Info card */}
          <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4">
            <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              About Coverage Calculation
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Coverage is calculated as the area ratio of the display gamut triangle
              to each standard gamut triangle using the Shoelace formula. This method
              gives the overall area percentage, not the intersection-based coverage.
              Intersection-based calculation will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
