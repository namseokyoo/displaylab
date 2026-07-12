import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import Home from '@/pages/Home';

const GamutAnalyzer = lazy(() => import('@/pages/GamutAnalyzer'));
const ColorCalculator = lazy(() => import('@/pages/ColorCalculator'));
const ViewingAngle = lazy(() => import('@/pages/ViewingAngle'));
const SpectrumAnalyzer = lazy(() => import('@/pages/SpectrumAnalyzer'));
const HDRAnalyzer = lazy(() => import('@/pages/HDRAnalyzer'));
const PanelComparison = lazy(() => import('@/pages/PanelComparison'));

function deferredPage(page: ReactNode) {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Loading">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
        </div>
      )}
    >
      {page}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gamut-analyzer" element={deferredPage(<GamutAnalyzer />)} />
          <Route path="/color-calculator" element={deferredPage(<ColorCalculator />)} />
          <Route path="/viewing-angle" element={deferredPage(<ViewingAngle />)} />
          <Route path="/spectrum-analyzer" element={deferredPage(<SpectrumAnalyzer />)} />
          <Route path="/hdr-analyzer" element={deferredPage(<HDRAnalyzer />)} />
          <Route path="/panel-comparison" element={deferredPage(<PanelComparison />)} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
