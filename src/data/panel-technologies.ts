/**
 * Panel Technology Data
 *
 * Core comparison dataset for common display panel technologies.
 */

export interface PanelSpecs {
  viewingAngle: number;
  contrastRatio: number;
  responseTime: number;
  colorGamut: number;
  lifespan: number;
  powerEfficiency: number;
}

export interface PanelTechnology {
  id: string;
  name: string;
  shortName: string;
  description: string;
  specs: PanelSpecs;
  pros: string[];
  cons: string[];
  bestFor: string[];
  priceRange: 'budget' | 'mid' | 'premium' | 'flagship';
  color: string;
}

export const SPEC_LABELS = [
  { key: 'viewingAngle', label: 'Viewing Angle' },
  { key: 'contrastRatio', label: 'Contrast Ratio' },
  { key: 'responseTime', label: 'Response Time' },
  { key: 'colorGamut', label: 'Color Gamut' },
  { key: 'lifespan', label: 'Lifespan' },
  { key: 'powerEfficiency', label: 'Power Efficiency' },
] as const;

export const PANEL_TECHNOLOGIES: PanelTechnology[] = [
  {
    id: 'ips',
    name: 'In-Plane Switching (IPS)',
    shortName: 'IPS',
    description:
      'IPS LCD aligns liquid crystals parallel to the substrate, improving viewing stability and color consistency. It is widely used for productivity and content work where color shift at off-axis angles must stay low.',
    specs: {
      viewingAngle: 9,
      contrastRatio: 4,
      responseTime: 6,
      colorGamut: 7,
      lifespan: 8,
      powerEfficiency: 6,
    },
    pros: [
      'Excellent viewing angles and color consistency',
      'Reliable long-term panel stability',
      'Widely available across many price points',
      'Strong all-around performance for daily use',
    ],
    cons: [
      'Lower native contrast than VA or OLED',
      'Black levels appear gray in dark rooms',
      'Backlight bleed can be visible on some units',
    ],
    bestFor: ['Office productivity', 'Photo editing', 'General desktop use'],
    priceRange: 'mid',
    color: '#3b82f6',
  },
  {
    id: 'va',
    name: 'Vertical Alignment (VA)',
    shortName: 'VA',
    description:
      'VA LCD aligns liquid crystals vertically at rest to block more backlight and improve contrast. It is popular for users who prioritize deeper blacks without moving to emissive panel costs.',
    specs: {
      viewingAngle: 6,
      contrastRatio: 7,
      responseTime: 4,
      colorGamut: 6,
      lifespan: 8,
      powerEfficiency: 6,
    },
    pros: [
      'Higher native contrast than IPS',
      'Darker black levels for media consumption',
      'Good value for large-format displays',
    ],
    cons: [
      'Narrower viewing angles than IPS and OLED',
      'Slower response can cause dark-level smearing',
      'Color shift is more noticeable off-center',
    ],
    bestFor: ['Movie watching', 'General use on a budget', 'High-contrast desktop setup'],
    priceRange: 'budget',
    color: '#8b5cf6',
  },
  {
    id: 'oled',
    name: 'Organic Light-Emitting Diode (OLED)',
    shortName: 'OLED',
    description:
      'OLED uses self-emissive pixels, so each pixel can switch fully off for true black and effectively infinite contrast. Its near-instant response and wide viewing angles make it a top-tier visual technology.',
    specs: {
      viewingAngle: 10,
      contrastRatio: 10,
      responseTime: 10,
      colorGamut: 9,
      lifespan: 5,
      powerEfficiency: 7,
    },
    pros: [
      'Perfect black levels with pixel-level control',
      'Extremely fast response for motion clarity',
      'Wide viewing angles with minimal color shift',
      'Strong HDR impact in dark scenes',
    ],
    cons: [
      'Burn-in risk under static long-term content',
      'Lower full-screen brightness than top Mini-LED',
      'Panel lifespan is lower than most LCD variants',
    ],
    bestFor: ['High-end gaming', 'Cinema content', 'Premium visual experience'],
    priceRange: 'premium',
    color: '#ef4444',
  },
  {
    id: 'mini-led',
    name: 'Mini-LED LCD',
    shortName: 'Mini-LED',
    description:
      'Mini-LED is an advanced LCD backlight architecture with many local dimming zones. It dramatically increases brightness and HDR punch while preserving LCD durability and manufacturing scale.',
    specs: {
      viewingAngle: 8,
      contrastRatio: 8,
      responseTime: 7,
      colorGamut: 8,
      lifespan: 8,
      powerEfficiency: 5,
    },
    pros: [
      'Very high peak brightness for HDR',
      'Strong contrast with local dimming',
      'Longer lifespan profile than OLED',
      'Good balance of speed and color performance',
    ],
    cons: [
      'Blooming/halo artifacts can appear in high-contrast scenes',
      'Power draw can be high at bright output',
      'Uniformity depends on dimming algorithm quality',
    ],
    bestFor: ['HDR movies', 'Bright-room viewing', 'Mixed desktop and media use'],
    priceRange: 'premium',
    color: '#f59e0b',
  },
  {
    id: 'qd-oled',
    name: 'Quantum Dot OLED (QD-OLED)',
    shortName: 'QD-OLED',
    description:
      'QD-OLED combines self-emissive OLED with quantum dot color conversion to raise color volume and maintain deep blacks. It delivers flagship-level motion, contrast, and saturation for premium displays.',
    specs: {
      viewingAngle: 10,
      contrastRatio: 10,
      responseTime: 10,
      colorGamut: 10,
      lifespan: 5,
      powerEfficiency: 6,
    },
    pros: [
      'Outstanding color gamut and color volume',
      'Perfect black with top-tier contrast',
      'Instant-like response for competitive gaming',
      'Excellent off-axis image stability',
    ],
    cons: [
      'Premium pricing with limited model availability',
      'Burn-in considerations remain like OLED',
      'Long-term lifespan trails mature LCD families',
    ],
    bestFor: ['Flagship gaming', 'Professional HDR creation', 'Best-in-class image quality'],
    priceRange: 'flagship',
    color: '#10b981',
  },
];
