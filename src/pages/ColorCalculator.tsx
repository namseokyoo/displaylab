/**
 * Color Science Calculator Page
 *
 * Integrates four calculators: Coordinate Converter, CCT Calculator, Delta E Calculator,
 * and Universal Color Space Converter.
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CoordinateConverter from '@/components/color-calculator/CoordinateConverter';
import CCTCalculator from '@/components/color-calculator/CCTCalculator';
import DeltaECalculator from '@/components/color-calculator/DeltaECalculator';
import UniversalConverter from '@/components/color-calculator/UniversalConverter';
import ShareButton from '@/components/common/ShareButton';
import SEO from '@/components/common/SEO';
import { encodeColorState, decodeColorState } from '@/lib/url-share';
import { toolJsonLd } from '@/lib/seo-data';

export default function ColorCalculator() {
  // URL param restoration seed (read once)
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDecoded = useMemo(() => decodeColorState(searchParams), [searchParams]);

  // Shared state for URL sharing with UniversalConverter
  const [sharedSpace] = useState<string | null>(() => initialDecoded?.space ?? null);
  const [sharedValues] = useState<Record<string, string> | null>(() => initialDecoded?.values ?? null);

  // Current converter state for share button
  const converterStateRef = useRef<{ space: string; values: Record<string, string> }>({ space: 'xyz', values: {} });

  const handleConverterStateChange = useCallback((space: string, values: Record<string, string>) => {
    converterStateRef.current = { space, values };
  }, []);

  const urlRestored = useRef(false);

  useEffect(() => {
    if (urlRestored.current) return;
    if (initialDecoded) {
      setSearchParams(new URLSearchParams(), { replace: true });
    }
    urlRestored.current = true;
  }, [initialDecoded, setSearchParams]);

  const getShareUrl = useCallback(() => {
    const { space, values } = converterStateRef.current;
    const params = encodeColorState(space, values);
    return `${window.location.origin}${window.location.pathname}?${params}`;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Color Science Calculator - Display Lab"
        description="Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000), and universal color space converter (10 color spaces)."
        keywords="delta E calculator, CIEDE2000, CIE94, CIE76, CCT calculator, XYZ to xyY, color science, CIE Lab, color converter, sRGB, CMYK, HSL, LCh"
        path="/color-calculator"
        jsonLd={toolJsonLd(
          'Color Science Calculator',
          'Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000), and universal color space converter.',
          '/color-calculator',
        )}
      />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Color Science Calculator</h1>
          <ShareButton getShareUrl={getShareUrl} />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Quick CIE color calculations: coordinate conversion, CCT &amp; Duv, Delta E, and universal color space converter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CoordinateConverter />
        <CCTCalculator />
        <DeltaECalculator />
      </div>

      <div className="mt-6">
        <UniversalConverter
          initialSpace={sharedSpace}
          initialValues={sharedValues}
          onStateChange={handleConverterStateChange}
        />
      </div>
    </div>
  );
}
