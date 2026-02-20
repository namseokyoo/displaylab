/**
 * Use Case Recommendation Component
 *
 * Curated first/second panel recommendations by common workloads.
 */

import { PANEL_TECHNOLOGIES } from '@/data/panel-technologies';
import { useTranslation } from '@/lib/i18n';

interface UseCaseItem {
  categoryKey: string;
  first: string;
  second: string;
  reasonKey: string;
}

const USE_CASES: UseCaseItem[] = [
  { categoryKey: 'panel.useCaseGaming', first: 'qd-oled', second: 'oled', reasonKey: 'panel.reasonGaming' },
  { categoryKey: 'panel.useCaseEditing', first: 'qd-oled', second: 'ips', reasonKey: 'panel.reasonEditing' },
  { categoryKey: 'panel.useCaseOffice', first: 'ips', second: 'va', reasonKey: 'panel.reasonOffice' },
  { categoryKey: 'panel.useCaseHdr', first: 'mini-led', second: 'qd-oled', reasonKey: 'panel.reasonHdr' },
  { categoryKey: 'panel.useCaseGeneral', first: 'ips', second: 'mini-led', reasonKey: 'panel.reasonGeneral' },
];

const PANEL_BY_ID = Object.fromEntries(PANEL_TECHNOLOGIES.map((panel) => [panel.id, panel]));

export default function UseCaseRecommendation() {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {USE_CASES.map((item) => {
        const firstPanel = PANEL_BY_ID[item.first];
        const secondPanel = PANEL_BY_ID[item.second];

        return (
          <article
            key={item.category}
            className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t(item.categoryKey)}</h3>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <span className="text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">1st</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: firstPanel?.color }} />
                <span className="font-medium">{firstPanel?.shortName}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">2nd</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondPanel?.color }} />
                <span>{secondPanel?.shortName}</span>
              </p>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(item.reasonKey)}</p>
          </article>
        );
      })}
    </div>
  );
}
