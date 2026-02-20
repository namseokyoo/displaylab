/**
 * Color Science Calculator Page
 *
 * Integrates four calculators: Coordinate Converter, CCT Calculator, Delta E Calculator,
 * and Universal Color Space Converter.
 */

import CoordinateConverter from '@/components/color-calculator/CoordinateConverter';
import CCTCalculator from '@/components/color-calculator/CCTCalculator';
import DeltaECalculator from '@/components/color-calculator/DeltaECalculator';
import UniversalConverter from '@/components/color-calculator/UniversalConverter';
import SEO from '@/components/common/SEO';
import { toolJsonLd } from '@/lib/seo-data';

export default function ColorCalculator() {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Color Science Calculator</h1>
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
        <UniversalConverter />
      </div>
    </div>
  );
}
