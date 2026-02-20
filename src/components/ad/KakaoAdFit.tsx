/**
 * KakaoAdFit Component
 *
 * Dynamically loads the Kakao AdFit SDK script and renders an ad unit.
 * Adapted from the nbbang project reference for Vite + React.
 *
 * @see https://adfit.kakao.com – Official SDK documentation
 */

import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  adUnitId: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function KakaoAdFit({
  adUnitId,
  width = 320,
  height = 100,
  className = '',
}: KakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // The AdFit SDK scans for <ins class="kakao_ad_area"> elements on script load.
    // We append the script inside the container so the scan finds our <ins> element.
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    script.charset = 'utf-8';
    containerRef.current.appendChild(script);

    return () => {
      try {
        const win = window as Window & { adfit?: { destroy: (id: string) => void } };
        if (win.adfit) {
          win.adfit.destroy(adUnitId);
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, [adUnitId]);

  return (
    <div
      ref={containerRef}
      className={`kakao-adfit-container flex justify-center items-center ${className}`}
      style={{ minHeight: height }}
      aria-label="Advertisement"
    >
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnitId}
        data-ad-width={width.toString()}
        data-ad-height={height.toString()}
      />
    </div>
  );
}
