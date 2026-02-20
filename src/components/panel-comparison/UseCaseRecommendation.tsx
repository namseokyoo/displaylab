/**
 * Use Case Recommendation Component
 *
 * Curated first/second panel recommendations by common workloads.
 */

import { PANEL_TECHNOLOGIES } from '@/data/panel-technologies';

interface UseCaseItem {
  category: string;
  first: string;
  second: string;
  reason: string;
}

const USE_CASES: UseCaseItem[] = [
  {
    category: 'Gaming',
    first: 'qd-oled',
    second: 'oled',
    reason: 'Fast response time, perfect black levels, and very high color performance.',
  },
  {
    category: 'Video/Photo Editing',
    first: 'qd-oled',
    second: 'ips',
    reason: 'Top color reproduction with wide viewing angle stability.',
  },
  {
    category: 'Office/Productivity',
    first: 'ips',
    second: 'va',
    reason: 'Wide viewing angles, practical pricing, and long service life.',
  },
  {
    category: 'HDR Content',
    first: 'mini-led',
    second: 'qd-oled',
    reason: 'High brightness output with local dimming and strong contrast control.',
  },
  {
    category: 'General Use',
    first: 'ips',
    second: 'mini-led',
    reason: 'Balanced performance profile with reasonable total ownership cost.',
  },
];

const PANEL_BY_ID = Object.fromEntries(PANEL_TECHNOLOGIES.map((panel) => [panel.id, panel]));

export default function UseCaseRecommendation() {
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.category}</h3>

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

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.reason}</p>
          </article>
        );
      })}
    </div>
  );
}
