/**
 * Panel Card Component
 *
 * Shows panel summary, pros/cons, and recommended use cases.
 */

import type { PanelTechnology } from '@/data/panel-technologies';
import { useTranslation } from '@/lib/i18n';

interface PanelCardProps {
  panel: PanelTechnology;
}

const PRICE_LABEL_KEYS: Record<PanelTechnology['priceRange'], string> = {
  budget: 'panel.priceBudget',
  mid: 'panel.priceMid',
  premium: 'panel.pricePremium',
  flagship: 'panel.priceFlagship',
};

const PRICE_BADGE_STYLES: Record<PanelTechnology['priceRange'], string> = {
  budget: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
  mid: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  premium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
  flagship: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
};

export default function PanelCard({ panel }: PanelCardProps) {
  const { t } = useTranslation();

  return (
    <article className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
      <span
        className="absolute top-5 left-5 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: panel.color }}
        aria-hidden
      />

      <header className="pl-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{panel.name}</h3>
        <span
          className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-medium ${PRICE_BADGE_STYLES[panel.priceRange]}`}
        >
          {t(PRICE_LABEL_KEYS[panel.priceRange])}
        </span>
      </header>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{panel.description}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">{t('panel.pros')}</h4>
          <ul className="space-y-1.5">
            {panel.pros.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400 mb-2">{t('panel.cons')}</h4>
          <ul className="space-y-1.5">
            {panel.cons.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{t('panel.bestFor')}</h4>
        <div className="flex flex-wrap gap-2">
          {panel.bestFor.map((item) => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700/60 dark:text-gray-200 dark:border-gray-600"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
