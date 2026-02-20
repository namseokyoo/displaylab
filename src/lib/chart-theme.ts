/**
 * Chart Theme Colors
 *
 * Provides consistent color palettes for D3.js charts
 * based on current dark/light theme.
 */

export interface ChartColors {
  /** SVG background color */
  background: string;
  /** Grid line color */
  grid: string;
  /** Axis line/tick color */
  axis: string;
  /** Axis label text color */
  axisLabel: string;
  /** Title text color */
  title: string;
  /** Wavelength label color */
  wavelengthLabel: string;
  /** D65 label and general annotation color */
  annotation: string;
  /** Locus fill background */
  locusFill: string;
  /** D65 marker fill */
  d65Fill: string;
  /** D65 marker stroke */
  d65Stroke: string;
  /** Data point stroke (for contrast) */
  pointStroke: string;
  /** Legend text color */
  legendText: string;
  /** Legend background */
  legendBg: string;
  /** Data value label color */
  valueLabel: string;
  /** Spoke line color (polar plot) */
  spoke: string;
  /** Ring line color (polar plot) */
  ring: string;
}

export function getChartColors(isDark: boolean): ChartColors {
  if (isDark) {
    return {
      background: '#111827',   // gray-900
      grid: '#1f2937',         // gray-800
      axis: '#6b7280',         // gray-500
      axisLabel: '#9ca3af',    // gray-400
      title: '#d1d5db',        // gray-300
      wavelengthLabel: '#6b7280', // gray-500
      annotation: '#9ca3af',   // gray-400
      locusFill: 'rgba(50, 50, 50, 0.3)',
      d65Fill: '#ffffff',
      d65Stroke: '#374151',    // gray-700
      pointStroke: '#111827',  // gray-900
      legendText: '#9ca3af',   // gray-400
      legendBg: '#111827',     // gray-900
      valueLabel: '#d1d5db',   // gray-300
      spoke: '#1f2937',        // gray-800
      ring: '#374151',         // gray-700
    };
  }
  return {
    background: '#ffffff',
    grid: '#e5e7eb',           // gray-200
    axis: '#9ca3af',           // gray-400
    axisLabel: '#6b7280',      // gray-500
    title: '#374151',          // gray-700
    wavelengthLabel: '#9ca3af', // gray-400
    annotation: '#6b7280',     // gray-500
    locusFill: 'rgba(200, 200, 200, 0.3)',
    d65Fill: '#000000',
    d65Stroke: '#d1d5db',      // gray-300
    pointStroke: '#ffffff',
    legendText: '#6b7280',     // gray-500
    legendBg: '#f9fafb',       // gray-50
    valueLabel: '#374151',     // gray-700
    spoke: '#e5e7eb',          // gray-200
    ring: '#d1d5db',           // gray-300
  };
}
