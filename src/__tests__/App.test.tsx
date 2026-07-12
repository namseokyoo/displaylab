import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { I18nProvider } from '@/lib/i18n';

vi.mock('@/components/common/Layout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { default: () => <Outlet /> };
});
vi.mock('@/pages/Home', () => ({ default: () => <h1>Home route</h1> }));
vi.mock('@/pages/GamutAnalyzer', () => ({ default: () => <h1>Gamut route</h1> }));
vi.mock('@/pages/ColorCalculator', () => ({ default: () => <h1>Color route</h1> }));
vi.mock('@/pages/ViewingAngle', () => ({ default: () => <h1>Viewing route</h1> }));
vi.mock('@/pages/SpectrumAnalyzer', () => ({ default: () => <h1>Spectrum route</h1> }));
vi.mock('@/pages/HDRAnalyzer', () => ({ default: () => <h1>HDR route</h1> }));
vi.mock('@/pages/PanelComparison', () => ({ default: () => <h1>Panel route</h1> }));

const routes = [
  ['/', 'Home route'],
  ['/gamut-analyzer', 'Gamut route'],
  ['/color-calculator', 'Color route'],
  ['/viewing-angle', 'Viewing route'],
  ['/spectrum-analyzer', 'Spectrum route'],
  ['/hdr-analyzer', 'HDR route'],
  ['/panel-comparison', 'Panel route'],
] as const;

describe('App routes', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it.each(routes)('resolves %s through the application router', async (path, heading) => {
    window.history.pushState({}, '', path);

    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
