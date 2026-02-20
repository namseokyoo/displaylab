import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import Home from '@/pages/Home';
import GamutAnalyzer from '@/pages/GamutAnalyzer';
import ColorCalculator from '@/pages/ColorCalculator';
import ViewingAngle from '@/pages/ViewingAngle';
import SpectrumAnalyzer from '@/pages/SpectrumAnalyzer';
import HDRAnalyzer from '@/pages/HDRAnalyzer';
import PanelComparison from '@/pages/PanelComparison';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gamut-analyzer" element={<GamutAnalyzer />} />
          <Route path="/color-calculator" element={<ColorCalculator />} />
          <Route path="/viewing-angle" element={<ViewingAngle />} />
          <Route path="/spectrum-analyzer" element={<SpectrumAnalyzer />} />
          <Route path="/hdr-analyzer" element={<HDRAnalyzer />} />
          <Route path="/panel-comparison" element={<PanelComparison />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
