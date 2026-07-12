export type LightQualityMetric = 'cri' | 'tm30' | 'tlci';

export interface LightQualityValidation {
  metric: LightQualityMetric;
  reference: string;
  status: 'experimental' | 'disabled';
  availability: 'ra-only' | 'disabled';
  claimPolicy: 'not-a-standard-score';
  blockingGaps: readonly string[];
}

/**
 * Accuracy claim gate for light-quality calculations.
 *
 * A metric must not be presented as a standards result while any blocking gap
 * remains. This registry is deliberately separate from the calculators so UI
 * and exports can fail closed without hiding the experimental analysis code.
 */
export const LIGHT_QUALITY_VALIDATION: Record<LightQualityMetric, LightQualityValidation> = {
  cri: {
    metric: 'cri',
    reference: 'CIE 13.3-1995',
    status: 'experimental',
    availability: 'ra-only',
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'Ra passes all 31 declared reference, fluorescent, HID, and LED holdouts within +/- 1.0.',
      'Individual R1-R14 indices are not exposed until the serialized fixture interpolation contract and CRI-specific CCT oracle are corrected.',
      'Direct CIE D008 comparison is unavailable in the current macOS/web toolchain; the product is narrowed to Ra.',
    ],
  },
  tm30: {
    metric: 'tm30',
    reference: 'ANSI/IES TM-30-24',
    status: 'disabled',
    availability: 'disabled',
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'ANSI/IES TM-30-24 and its calculator files are distributed through the IES publication package.',
      'No legally reusable TM-30-24 CES dataset and web implementation are available in the audited repository.',
      'Numeric output remains disabled until licensed sources, fixtures, tolerances, and independent review are present.',
    ],
  },
  tlci: {
    metric: 'tlci',
    reference: 'EBU Tech 3355',
    status: 'disabled',
    availability: 'disabled',
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'The official EBU package provides compiled assessment applications, not a reusable web implementation under an audited source license.',
      'Numeric output remains disabled until source reuse rights, fixtures, tolerances, and independent review are present.',
    ],
  },
};

export function isStandardsValidated(metric: LightQualityMetric): boolean {
  return LIGHT_QUALITY_VALIDATION[metric].claimPolicy !== 'not-a-standard-score';
}

export function isMetricAvailable(metric: LightQualityMetric): boolean {
  return LIGHT_QUALITY_VALIDATION[metric].availability !== 'disabled';
}
