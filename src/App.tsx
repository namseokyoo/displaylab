import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Link, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import RouteBoundary from '@/components/common/RouteBoundary';
import Home from '@/pages/Home';
import { useTranslation } from '@/lib/i18n';

const GamutAnalyzer = lazy(() => import('@/pages/GamutAnalyzer'));
const ColorCalculator = lazy(() => import('@/pages/ColorCalculator'));
const ViewingAngle = lazy(() => import('@/pages/ViewingAngle'));
const SpectrumAnalyzer = lazy(() => import('@/pages/SpectrumAnalyzer'));
const HDRAnalyzer = lazy(() => import('@/pages/HDRAnalyzer'));
const PanelComparison = lazy(() => import('@/pages/PanelComparison'));

function DeferredPage({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <RouteBoundary
      resetKey={location.pathname}
      fallback={
        <div className="mx-auto flex min-h-80 max-w-lg flex-col items-center justify-center px-6 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            aria-hidden="true"
          >
            !
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t('common.routeLoadError')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {t('common.routeLoadErrorHelp')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {t('common.reloadPage')}
            </button>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {t('common.goHome')}
            </Link>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div
            className="flex min-h-64 items-center justify-center"
            role="status"
            aria-label={t('common.loading')}
          >
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          </div>
        }
      >
        {children}
      </Suspense>
    </RouteBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/gamut-analyzer"
            element={
              <DeferredPage>
                <GamutAnalyzer />
              </DeferredPage>
            }
          />
          <Route
            path="/color-calculator"
            element={
              <DeferredPage>
                <ColorCalculator />
              </DeferredPage>
            }
          />
          <Route
            path="/viewing-angle"
            element={
              <DeferredPage>
                <ViewingAngle />
              </DeferredPage>
            }
          />
          <Route
            path="/spectrum-analyzer"
            element={
              <DeferredPage>
                <SpectrumAnalyzer />
              </DeferredPage>
            }
          />
          <Route
            path="/hdr-analyzer"
            element={
              <DeferredPage>
                <HDRAnalyzer />
              </DeferredPage>
            }
          />
          <Route
            path="/panel-comparison"
            element={
              <DeferredPage>
                <PanelComparison />
              </DeferredPage>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
