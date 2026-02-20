/**
 * Panel Technology Comparator Page
 *
 * Interactive comparison view for IPS, VA, OLED, Mini-LED, and QD-OLED.
 */

import { useCallback, useMemo, useState } from 'react';
import SEO from '@/components/common/SEO';
import ShareButton from '@/components/common/ShareButton';
import ComparisonTable from '@/components/panel-comparison/ComparisonTable';
import PanelCard from '@/components/panel-comparison/PanelCard';
import RadarChart from '@/components/panel-comparison/RadarChart';
import UseCaseRecommendation from '@/components/panel-comparison/UseCaseRecommendation';
import { PANEL_TECHNOLOGIES } from '@/data/panel-technologies';
import { toolJsonLd } from '@/lib/seo-data';

const ALL_PANEL_IDS = PANEL_TECHNOLOGIES.map((panel) => panel.id);

export default function PanelComparison() {
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ALL_PANEL_IDS;
    const queryValue = new URLSearchParams(window.location.search).get('panels');
    if (!queryValue) return ALL_PANEL_IDS;

    const requestedIds = queryValue
      .split(',')
      .map((id) => id.trim())
      .filter((id) => ALL_PANEL_IDS.includes(id));

    return requestedIds.length > 0 ? requestedIds : ALL_PANEL_IDS;
  });

  const selectedPanels = useMemo(
    () => PANEL_TECHNOLOGIES.filter((panel) => selectedPanelIds.includes(panel.id)),
    [selectedPanelIds],
  );

  const handleTogglePanel = useCallback((panelId: string) => {
    setSelectedPanelIds((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId],
    );
  }, []);

  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '/panel-comparison';
    const url = new URL(`${window.location.origin}/panel-comparison`);
    if (selectedPanelIds.length !== ALL_PANEL_IDS.length) {
      url.searchParams.set('panels', selectedPanelIds.join(','));
    }
    return url.toString();
  }, [selectedPanelIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <SEO
        title="Panel Technology Comparator - Display Lab"
        description="Compare panel technologies side by side: IPS, VA, OLED, Mini-LED, and QD-OLED with interactive radar charts and detailed specs."
        keywords="panel technology comparator, IPS vs VA, OLED, Mini-LED, QD-OLED, display panel comparison"
        path="/panel-comparison"
        jsonLd={toolJsonLd(
          'Panel Technology Comparator',
          'Compare display panel technologies side by side with interactive radar charts and detailed specifications.',
          '/panel-comparison',
        )}
      />

      <section className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Panel Technology Comparator</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-3xl">
          Compare IPS, VA, OLED, Mini-LED, and QD-OLED using normalized performance scores.
          Toggle panel types to overlay them on a radar chart, then inspect detailed strengths and tradeoffs.
        </p>
      </section>

      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Panels</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose one or more panel technologies to compare.</p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PANEL_TECHNOLOGIES.map((panel) => {
            const isChecked = selectedPanelIds.includes(panel.id);

            return (
              <label
                key={panel.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 cursor-pointer bg-gray-50/60 dark:bg-gray-900/40"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTogglePanel(panel.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: panel.color }} />
                <span className="text-sm text-gray-700 dark:text-gray-200">{panel.shortName}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Radar Comparison</h2>
        <RadarChart panels={selectedPanels} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Specification Comparison</h2>
        <ComparisonTable panels={selectedPanels} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Panel Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PANEL_TECHNOLOGIES.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Best Panel by Use Case</h2>
        <UseCaseRecommendation />
      </section>

      <div className="flex justify-end">
        <ShareButton getShareUrl={getShareUrl} />
      </div>
    </div>
  );
}
