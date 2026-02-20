/**
 * Home / Landing Page
 *
 * Hero section + tool cards + trust badges + SidequestLab credit.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';
import { useTranslation } from '@/lib/i18n';
import { SITE_JSON_LD } from '@/lib/seo-data';

interface ToolItem {
  titleKey: string;
  descKey: string;
  path: string;
  icon: ReactNode;
  status: 'available' | 'coming-soon';
  ctaKey: string;
}

const TOOLS: ToolItem[] = [
  {
    titleKey: 'home.toolGamutTitle',
    descKey: 'home.toolGamutDesc',
    path: '/gamut-analyzer',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolGamutCta',
  },
  {
    titleKey: 'home.toolColorTitle',
    descKey: 'home.toolColorDesc',
    path: '/color-calculator',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolColorCta',
  },
  {
    titleKey: 'home.toolViewingTitle',
    descKey: 'home.toolViewingDesc',
    path: '/viewing-angle',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolViewingCta',
  },
  {
    titleKey: 'home.toolSpectrumTitle',
    descKey: 'home.toolSpectrumDesc',
    path: '/spectrum-analyzer',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 17.25l4.286-4.286a1.5 1.5 0 012.122 0l2.184 2.184a1.5 1.5 0 002.122 0L21 8.25"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 6.75h18M3 12h18M3 17.25h18"
          opacity="0.4"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolSpectrumCta',
  },
  {
    titleKey: 'home.toolPanelTitle',
    descKey: 'home.toolPanelDesc',
    path: '/panel-comparison',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolPanelCta',
  },
  {
    titleKey: 'home.toolHdrTitle',
    descKey: 'home.toolHdrDesc',
    path: '/hdr-analyzer',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 3v2.25m0 13.5V21m6.364-14.864-1.591 1.591M7.227 16.773l-1.591 1.591M21 12h-2.25M5.25 12H3m15.364 4.773-1.591-1.591M7.227 7.227 5.636 5.636M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
        />
      </svg>
    ),
    status: 'available',
    ctaKey: 'home.toolHdrCta',
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <SEO
        title={t('seo.homeTitle')}
        description={t('seo.homeDesc')}
        keywords="display analysis, color gamut, CIE diagram, delta E calculator, viewing angle, CCT calculator, display engineering"
        path="/"
        jsonLd={SITE_JSON_LD}
      />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-blue-500 dark:text-blue-400">{t('home.heroTitle1')}</span>{' '}
            {t('home.heroTitle2')}
            <br />
            {t('home.heroTitle3')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/gamut-analyzer"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
            >
              {t('home.ctaGamut')}
            </Link>
            <Link
              to="/color-calculator"
              className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-medium transition-colors text-sm border border-gray-200 dark:border-gray-700"
            >
              {t('home.ctaColor')}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              {t('home.badgePrivacy')}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('home.badgeStandard')}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('home.badgeFree')}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('home.toolsHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group relative flex flex-col p-6 rounded-xl bg-white border border-gray-200 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10"
              >
                <div className="text-blue-500 dark:text-blue-400 mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  {t(tool.titleKey)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {t(tool.descKey)}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {tool.status === 'coming-soon' ? (
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
                      Coming Soon (MVP-B)
                    </span>
                  ) : (
                    <span className="text-sm text-blue-500 group-hover:text-blue-400 dark:text-blue-400 dark:group-hover:text-blue-300 font-medium">
                      {t(tool.ctaKey)} &rarr;
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-white/50 border border-gray-200/50 dark:bg-gray-900/50 dark:border-gray-800/50">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.statProcessing')}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                {t('home.statProcessingSub')}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white/50 border border-gray-200/50 dark:bg-gray-900/50 dark:border-gray-800/50">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CIE</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.statValidated')}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                {t('home.statValidatedSub')}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white/50 border border-gray-200/50 dark:bg-gray-900/50 dark:border-gray-800/50">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Free</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.statFree')}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">{t('home.statFreeSub')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SidequestLab credit */}
      <section className="py-8 px-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-600">
          {t('home.builtBy')}{' '}
          <a
            href="https://github.com/namseokyoo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            SidequestLab
          </a>
        </p>
      </section>
    </div>
  );
}
