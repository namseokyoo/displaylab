/**
 * Home / Landing Page
 *
 * Hero section + 3 tool cards + trust badges + SidequestLab credit.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';
import { SITE_JSON_LD } from '@/lib/seo-data';

interface ToolItem {
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  status: 'available' | 'coming-soon';
  cta: string;
}

const TOOLS: ToolItem[] = [
  {
    title: 'Color Gamut Analyzer',
    description:
      'Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards. Calculate coverage percentage with CIE 1931 and 1976 diagrams.',
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
    cta: 'Analyze Gamut',
  },
  {
    title: 'Color Science Calculator',
    description:
      'Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000).',
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
    cta: 'Open Calculator',
  },
  {
    title: 'Viewing Angle Analyzer',
    description:
      'Upload goniometer CSV data to visualize display viewing angle performance: polar plots, color shift tracking, and Delta E heatmaps.',
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
    cta: 'Analyze Viewing Angle',
  },
];

export default function Home() {
  return (
    <div>
      <SEO
        title="Display Lab - Professional Display Analysis Tools"
        description="Free web-based tools for display engineers: viewing angle analysis, color gamut comparison, and color science calculations."
        keywords="display analysis, color gamut, CIE diagram, delta E calculator, viewing angle, CCT calculator, display engineering"
        path="/"
        jsonLd={SITE_JSON_LD}
      />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-blue-400">Professional</span> Display
            <br />
            Analysis Tools
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Free web-based tools for display engineers and researchers. Analyze viewing angles,
            compare color gamuts, and perform color science calculations — all in your browser.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/gamut-analyzer"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
            >
              Try Gamut Analyzer
            </Link>
            <Link
              to="/color-calculator"
              className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors text-sm border border-gray-700"
            >
              Open Color Calculator
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-green-400 bg-green-900/20 border-green-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Your data never leaves your browser
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-blue-400 bg-blue-900/20 border-blue-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Validated against CIE standards
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-purple-400 bg-purple-900/20 border-purple-800/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Free — no account required
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Analysis Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group relative flex flex-col p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-900/10"
              >
                <div className="text-blue-400 mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">{tool.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  {tool.status === 'coming-soon' ? (
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-800/50">
                      Coming Soon (MVP-B)
                    </span>
                  ) : (
                    <span className="text-sm text-blue-400 group-hover:text-blue-300 font-medium">
                      {tool.cta} &rarr;
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
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-gray-400">Client-side Processing</div>
              <div className="text-xs text-gray-600 mt-1">No data sent to servers</div>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="text-3xl font-bold text-white mb-2">CIE</div>
              <div className="text-sm text-gray-400">Standard Validated</div>
              <div className="text-xs text-gray-600 mt-1">Sharma 2005, CIE 15:2004</div>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="text-3xl font-bold text-white mb-2">Free</div>
              <div className="text-sm text-gray-400">No Account Required</div>
              <div className="text-xs text-gray-600 mt-1">Open for everyone</div>
            </div>
          </div>
        </div>
      </section>

      {/* SidequestLab credit */}
      <section className="py-8 px-4 text-center">
        <p className="text-sm text-gray-600">
          Built by{' '}
          <a
            href="https://github.com/namseokyoo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            SidequestLab
          </a>
        </p>
      </section>
    </div>
  );
}
