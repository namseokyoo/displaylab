/**
 * Display Gamut Preset Samples
 *
 * Real-world display primaries for common devices.
 * CIE 1931 xy coordinates from public measurement data.
 */

import type { GamutData } from '@/types';

export interface GamutPreset extends GamutData {
  description: string;
  category: 'smartphone' | 'monitor' | 'tv' | 'laptop';
}

export const GAMUT_PRESETS: GamutPreset[] = [
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship AMOLED, wide color gamut display',
    category: 'smartphone',
    primaries: {
      red: { x: 0.678, y: 0.321 },
      green: { x: 0.258, y: 0.689 },
      blue: { x: 0.148, y: 0.051 },
    },
    whitePoint: { x: 0.313, y: 0.329 },
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'Super Retina XDR OLED, P3 wide color',
    category: 'smartphone',
    primaries: {
      red: { x: 0.680, y: 0.320 },
      green: { x: 0.265, y: 0.690 },
      blue: { x: 0.150, y: 0.060 },
    },
    whitePoint: { x: 0.313, y: 0.329 },
  },
  {
    name: 'LG C3 OLED TV (65")',
    description: 'WOLED 4K TV, near-perfect DCI-P3 coverage',
    category: 'tv',
    primaries: {
      red: { x: 0.681, y: 0.318 },
      green: { x: 0.260, y: 0.685 },
      blue: { x: 0.146, y: 0.054 },
    },
    whitePoint: { x: 0.312, y: 0.329 },
  },
  {
    name: 'Dell U2723QE (IPS)',
    description: 'Typical sRGB IPS monitor, 27-inch 4K',
    category: 'monitor',
    primaries: {
      red: { x: 0.639, y: 0.330 },
      green: { x: 0.299, y: 0.599 },
      blue: { x: 0.150, y: 0.060 },
    },
    whitePoint: { x: 0.313, y: 0.329 },
  },
  {
    name: 'MacBook Pro 16" (Liquid Retina XDR)',
    description: 'Mini-LED display with P3 wide color',
    category: 'laptop',
    primaries: {
      red: { x: 0.679, y: 0.319 },
      green: { x: 0.262, y: 0.688 },
      blue: { x: 0.149, y: 0.058 },
    },
    whitePoint: { x: 0.313, y: 0.329 },
  },
  {
    name: 'ASUS ProArt PA32UCX (Mini-LED)',
    description: 'Professional reference monitor, wide gamut',
    category: 'monitor',
    primaries: {
      red: { x: 0.685, y: 0.314 },
      green: { x: 0.201, y: 0.715 },
      blue: { x: 0.148, y: 0.048 },
    },
    whitePoint: { x: 0.313, y: 0.329 },
  },
];
