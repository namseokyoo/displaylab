/**
 * Kakao AdFit Configuration
 *
 * Ad unit IDs are read from environment variables.
 * When the variables are not set, ads are not rendered.
 */

export const AD_CONFIG = {
  desktop: {
    unitId: import.meta.env.VITE_ADFIT_UNIT_DESKTOP as string | undefined,
    width: 728,
    height: 90,
  },
  mobile: {
    unitId: import.meta.env.VITE_ADFIT_UNIT_MOBILE as string | undefined,
    width: 320,
    height: 100,
  },
} as const;

/** Returns true when at least one ad unit ID is configured. */
export function isAdEnabled(): boolean {
  return !!(AD_CONFIG.desktop.unitId || AD_CONFIG.mobile.unitId);
}
