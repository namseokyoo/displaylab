import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import DeltaECalculator from '@/components/color-calculator/DeltaECalculator';
import SEO from '@/components/common/SEO';
import { toolJsonLd } from '@/lib/seo-data';

const examples = [
  {
    title: 'Reference pair: ΔE00 2.0425',
    detail: 'Lab(50, 2.6772, -79.7751) versus Lab(50, 0, -82.7485) is one of the published CIEDE2000 reference pairs used by this calculator’s test suite.',
  },
  {
    title: 'Small difference: ΔE00 1.2644',
    detail: 'Lab(60.2574, -34.0099, 36.2677) versus Lab(60.4626, -34.1751, 39.4387) provides a close-color comparison example.',
  },
  {
    title: 'Large difference: ΔE00 27.1492',
    detail: 'Lab(50, 2.5, 0) versus Lab(73, 25, -18) illustrates a clearly separated pair. Whether a value passes a production limit depends on the product and approved specification.',
  },
] as const;

const faqs = [
  {
    question: 'What is Delta E?',
    answer: 'Delta E is a numerical description of the difference between two colors represented in a color space such as CIE Lab. A lower value indicates that the measured colors are closer under the selected formula.',
  },
  {
    question: 'Which Delta E formula should I use?',
    answer: 'Use the formula required by the relevant specification, workflow, or customer agreement. CIEDE2000 is commonly used for perceptual color-difference work, while CIE76 and CIE94 may be required for compatibility with an existing process.',
  },
  {
    question: 'Does a Delta E value prove a display passes?',
    answer: 'No. This calculator reports mathematical color difference from two Lab inputs. Pass or fail depends on the measurement method, illuminant, observer, sample conditions, and acceptance criteria defined for the work.',
  },
] as const;

const deltaEFaqJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    toolJsonLd(
      'Delta E Calculator',
      'Compare two CIE Lab colors with CIEDE2000, CIE94, and CIE76 Delta E formulas in a free browser calculator.',
      '/delta-e-calculator',
    ),
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function DeltaECalculatorLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SEO
        title="Delta E Calculator — CIEDE2000, CIE94 & CIE76 | Display Lab"
        description="Compare two CIE Lab colors with CIEDE2000, CIE94, and CIE76 Delta E formulas. Free browser calculator with reference examples and formula guidance."
        keywords="Delta E calculator, CIEDE2000 calculator, CIE94, CIE76, Lab color difference, color tolerance"
        path="/delta-e-calculator"
        jsonLd={deltaEFaqJsonLd}
      />
      <Helmet>
        <link rel="alternate" hrefLang="en" href="https://displaylab.vercel.app/delta-e-calculator" />
        <link rel="alternate" hrefLang="x-default" href="https://displaylab.vercel.app/delta-e-calculator" />
      </Helmet>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Free browser tool</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Delta E Calculator</h1>
        <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Compare two CIE Lab colors with CIEDE2000, CIE94, and CIE76. Enter Lab values, choose a verified example, and keep the formula visible when you share the result with a reviewer.
        </p>
      </header>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)] lg:items-start">
        <DeltaECalculator />
        <aside className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm leading-6 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
          <h2 className="text-lg font-semibold">Use the formula your workflow requires</h2>
          <p className="mt-3">The three values can differ because the formulas weight lightness, chroma, and hue differently. This page calculates all three; it does not select a production tolerance for you.</p>
          <Link to="/color-calculator" className="mt-5 inline-flex font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
            Open the full color science calculator →
          </Link>
        </aside>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Worked reference examples</h2>
        <p className="mt-3 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">These examples document expected CIEDE2000 outputs used in Display Lab’s automated reference tests. They are calculation examples, not universal visual-acceptance thresholds.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <article key={example.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">{example.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{example.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delta E calculator FAQ</h2>
        <div className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {faqs.map((faq) => (
            <article key={faq.question} className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">More display analysis tools</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Use Display Lab’s gamut, viewing-angle, spectrum, HDR, and panel-comparison tools when the question needs more than two Lab coordinates.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
          <Link to="/gamut-analyzer" className="underline underline-offset-4">Gamut analyzer</Link>
          <Link to="/viewing-angle" className="underline underline-offset-4">Viewing angle</Link>
          <Link to="/spectrum-analyzer" className="underline underline-offset-4">Spectrum analyzer</Link>
        </div>
      </section>
    </div>
  );
}
