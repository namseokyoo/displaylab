/**
 * AdBanner – Responsive Kakao AdFit wrapper
 *
 * Renders a desktop-sized (728x90) or mobile-sized (320x100) ad unit
 * depending on the viewport width. The component renders nothing when
 * the corresponding ad unit ID is not configured via environment variables.
 *
 * Placement: below the main content area, visually separated from the
 * analysis tools so it never interferes with the user's workflow.
 */

import { AD_CONFIG, isAdEnabled } from '@/config/ad-config';
import KakaoAdFit from './KakaoAdFit';

interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  if (!isAdEnabled()) return null;

  const { desktop, mobile } = AD_CONFIG;

  return (
    <div
      className={`w-full flex justify-center py-4 ${className}`}
      role="complementary"
      aria-label="Sponsored content"
    >
      {/* Desktop banner (hidden on mobile) */}
      {desktop.unitId && (
        <div className="hidden md:block">
          <KakaoAdFit
            adUnitId={desktop.unitId}
            width={desktop.width}
            height={desktop.height}
          />
        </div>
      )}

      {/* Mobile banner (hidden on desktop) */}
      {mobile.unitId && (
        <div className="block md:hidden">
          <KakaoAdFit
            adUnitId={mobile.unitId}
            width={mobile.width}
            height={mobile.height}
          />
        </div>
      )}
    </div>
  );
}
