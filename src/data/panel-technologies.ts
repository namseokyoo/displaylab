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

export interface LocalizedPanelText {
  en: string;
  ko: string;
}

export interface PanelTechnology {
  id: string;
  name: string;
  shortName: string;
  description: LocalizedPanelText;
  specs: PanelSpecs;
  pros: LocalizedPanelText[];
  cons: LocalizedPanelText[];
  bestFor: LocalizedPanelText[];
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
    description: {
      en: 'IPS LCD aligns liquid crystals parallel to the substrate, improving viewing stability and color consistency. It is widely used for productivity and content work where color shift at off-axis angles must stay low.',
      ko: 'IPS LCD는 액정을 기판과 평행하게 배열해 시야각에 따른 색 변화와 밝기 변화를 줄입니다. 비스듬히 볼 때도 색 일관성이 중요한 사무 작업과 콘텐츠 제작에 널리 사용됩니다.',
    },
    specs: {
      viewingAngle: 9,
      contrastRatio: 4,
      responseTime: 6,
      colorGamut: 7,
      lifespan: 8,
      powerEfficiency: 6,
    },
    pros: [
      { en: 'Excellent viewing angles and color consistency', ko: '넓은 시야각과 안정적인 색 일관성' },
      { en: 'Reliable long-term panel stability', ko: '신뢰할 수 있는 장기 패널 안정성' },
      { en: 'Widely available across many price points', ko: '다양한 가격대에서 폭넓게 선택 가능' },
      { en: 'Strong all-around performance for daily use', ko: '일상 용도에 균형 잡힌 전반적 성능' },
    ],
    cons: [
      { en: 'Lower native contrast than VA or OLED', ko: 'VA나 OLED보다 낮은 기본 명암비' },
      { en: 'Black levels appear gray in dark rooms', ko: '어두운 환경에서 검은색이 회색처럼 보일 수 있음' },
      { en: 'Backlight bleed can be visible on some units', ko: '일부 제품에서 백라이트 빛샘이 보일 수 있음' },
    ],
    bestFor: [
      { en: 'Office productivity', ko: '사무 생산성 작업' },
      { en: 'Photo editing', ko: '사진 편집' },
      { en: 'General desktop use', ko: '일반 데스크톱 사용' },
    ],
    priceRange: 'mid',
    color: '#3b82f6',
  },
  {
    id: 'va',
    name: 'Vertical Alignment (VA)',
    shortName: 'VA',
    description: {
      en: 'VA LCD aligns liquid crystals vertically at rest to block more backlight and improve contrast. It is popular for users who prioritize deeper blacks without moving to emissive panel costs.',
      ko: 'VA LCD는 정지 상태의 액정을 수직으로 배열해 백라이트를 더 효과적으로 차단하고 명암비를 높입니다. 자발광 패널의 비용 부담 없이 깊은 검은색을 원하는 사용자에게 적합합니다.',
    },
    specs: {
      viewingAngle: 6,
      contrastRatio: 7,
      responseTime: 4,
      colorGamut: 6,
      lifespan: 8,
      powerEfficiency: 6,
    },
    pros: [
      { en: 'Higher native contrast than IPS', ko: 'IPS보다 높은 기본 명암비' },
      { en: 'Darker black levels for media consumption', ko: '영상 감상에 유리한 깊은 검은색' },
      { en: 'Good value for large-format displays', ko: '대형 화면에서 우수한 가격 대비 성능' },
    ],
    cons: [
      { en: 'Narrower viewing angles than IPS and OLED', ko: 'IPS와 OLED보다 좁은 시야각' },
      { en: 'Slower response can cause dark-level smearing', ko: '느린 응답으로 어두운 장면에서 잔상이 생길 수 있음' },
      { en: 'Color shift is more noticeable off-center', ko: '정면을 벗어나면 색 변화가 더 뚜렷함' },
    ],
    bestFor: [
      { en: 'Movie watching', ko: '영화 감상' },
      { en: 'General use on a budget', ko: '가성비 중심의 일반 사용' },
      { en: 'High-contrast desktop setup', ko: '고명암비 데스크톱 환경' },
    ],
    priceRange: 'budget',
    color: '#8b5cf6',
  },
  {
    id: 'oled',
    name: 'Organic Light-Emitting Diode (OLED)',
    shortName: 'OLED',
    description: {
      en: 'OLED uses self-emissive pixels, so each pixel can switch fully off for true black and effectively infinite contrast. Its near-instant response and wide viewing angles make it a top-tier visual technology.',
      ko: 'OLED는 픽셀마다 스스로 빛을 내며 완전히 끌 수 있어 완전한 검은색과 사실상 무한대의 명암비를 구현합니다. 매우 빠른 응답 속도와 넓은 시야각을 제공하는 고급 디스플레이 기술입니다.',
    },
    specs: {
      viewingAngle: 10,
      contrastRatio: 10,
      responseTime: 10,
      colorGamut: 9,
      lifespan: 5,
      powerEfficiency: 7,
    },
    pros: [
      { en: 'Perfect black levels with pixel-level control', ko: '픽셀 단위 제어로 구현하는 완전한 검은색' },
      { en: 'Extremely fast response for motion clarity', ko: '선명한 움직임을 위한 매우 빠른 응답 속도' },
      { en: 'Wide viewing angles with minimal color shift', ko: '색 변화가 적은 넓은 시야각' },
      { en: 'Strong HDR impact in dark scenes', ko: '어두운 장면에서 뛰어난 HDR 표현력' },
    ],
    cons: [
      { en: 'Burn-in risk under static long-term content', ko: '정적인 화면을 장시간 표시할 때 번인 위험' },
      { en: 'Lower full-screen brightness than top Mini-LED', ko: '상위 Mini-LED보다 낮은 전체 화면 밝기' },
      { en: 'Panel lifespan is lower than most LCD variants', ko: '대부분의 LCD 계열보다 짧은 패널 수명' },
    ],
    bestFor: [
      { en: 'High-end gaming', ko: '고사양 게임' },
      { en: 'Cinema content', ko: '영화 콘텐츠 감상' },
      { en: 'Premium visual experience', ko: '프리미엄 영상 경험' },
    ],
    priceRange: 'premium',
    color: '#ef4444',
  },
  {
    id: 'mini-led',
    name: 'Mini-LED LCD',
    shortName: 'Mini-LED',
    description: {
      en: 'Mini-LED is an advanced LCD backlight architecture with many local dimming zones. It dramatically increases brightness and HDR punch while preserving LCD durability and manufacturing scale.',
      ko: 'Mini-LED는 다수의 로컬 디밍 영역을 사용하는 고급 LCD 백라이트 구조입니다. LCD의 내구성과 생산성을 유지하면서 밝기와 HDR 표현력을 크게 높입니다.',
    },
    specs: {
      viewingAngle: 8,
      contrastRatio: 8,
      responseTime: 7,
      colorGamut: 8,
      lifespan: 8,
      powerEfficiency: 5,
    },
    pros: [
      { en: 'Very high peak brightness for HDR', ko: 'HDR에 유리한 매우 높은 최대 밝기' },
      { en: 'Strong contrast with local dimming', ko: '로컬 디밍을 통한 높은 명암비' },
      { en: 'Longer lifespan profile than OLED', ko: 'OLED보다 긴 수명 특성' },
      { en: 'Good balance of speed and color performance', ko: '응답 속도와 색 성능의 좋은 균형' },
    ],
    cons: [
      { en: 'Blooming/halo artifacts can appear in high-contrast scenes', ko: '고명암 장면에서 블루밍이나 후광이 생길 수 있음' },
      { en: 'Power draw can be high at bright output', ko: '높은 밝기에서 소비 전력이 커질 수 있음' },
      { en: 'Uniformity depends on dimming algorithm quality', ko: '디밍 알고리즘 품질에 따라 화면 균일도가 달라짐' },
    ],
    bestFor: [
      { en: 'HDR movies', ko: 'HDR 영화 감상' },
      { en: 'Bright-room viewing', ko: '밝은 환경에서의 시청' },
      { en: 'Mixed desktop and media use', ko: '데스크톱 작업과 미디어 감상 병행' },
    ],
    priceRange: 'premium',
    color: '#f59e0b',
  },
  {
    id: 'qd-oled',
    name: 'Quantum Dot OLED (QD-OLED)',
    shortName: 'QD-OLED',
    description: {
      en: 'QD-OLED combines self-emissive OLED with quantum dot color conversion to raise color volume and maintain deep blacks. It delivers flagship-level motion, contrast, and saturation for premium displays.',
      ko: 'QD-OLED는 자발광 OLED와 퀀텀닷 색 변환을 결합해 깊은 검은색을 유지하면서 컬러 볼륨을 높입니다. 움직임, 명암비, 색 포화도에서 플래그십급 성능을 제공합니다.',
    },
    specs: {
      viewingAngle: 10,
      contrastRatio: 10,
      responseTime: 10,
      colorGamut: 10,
      lifespan: 5,
      powerEfficiency: 6,
    },
    pros: [
      { en: 'Outstanding color gamut and color volume', ko: '뛰어난 색역과 컬러 볼륨' },
      { en: 'Perfect black with top-tier contrast', ko: '완전한 검은색과 최상급 명암비' },
      { en: 'Instant-like response for competitive gaming', ko: '경쟁 게임에 적합한 즉각적인 응답 속도' },
      { en: 'Excellent off-axis image stability', ko: '비스듬한 시야에서도 뛰어난 화질 안정성' },
    ],
    cons: [
      { en: 'Premium pricing with limited model availability', ko: '높은 가격과 제한적인 제품 선택지' },
      { en: 'Burn-in considerations remain like OLED', ko: 'OLED와 마찬가지로 번인 고려 필요' },
      { en: 'Long-term lifespan trails mature LCD families', ko: '장기 수명은 성숙한 LCD 계열보다 불리함' },
    ],
    bestFor: [
      { en: 'Flagship gaming', ko: '플래그십 게임 환경' },
      { en: 'Professional HDR creation', ko: '전문 HDR 콘텐츠 제작' },
      { en: 'Best-in-class image quality', ko: '최상급 화질 경험' },
    ],
    priceRange: 'flagship',
    color: '#10b981',
  },
];
