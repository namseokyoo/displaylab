export type LightQualityMetric = 'cri' | 'tm30' | 'tlci';

export interface LightQualityValidation {
  metric: LightQualityMetric;
  reference: string;
  status: 'experimental';
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
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'The four-fixture oracle set passes, but broader holdout and method-applicability coverage is not complete.',
      'The implementation has not been cross-checked against the CIE D008 program across its supported input domain.',
    ],
  },
  tm30: {
    metric: 'tm30',
    reference: 'ANSI/IES TM-30-24',
    status: 'experimental',
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'CES reflectances are synthetic rather than the official 99-sample set.',
      'The calculation uses CIELAB instead of the required CAM02-UCS method.',
      'The current independent numerical oracle covers TM-30-18, not the current TM-30-24 edition.',
    ],
  },
  tlci: {
    metric: 'tlci',
    reference: 'EBU Tech 3355',
    status: 'experimental',
    claimPolicy: 'not-a-standard-score',
    blockingGaps: [
      'ColorChecker reflectances and the camera response are approximations.',
      'The score mapping does not implement the EBU camera/display pipeline or Qa formula.',
    ],
  },
};

export function isStandardsValidated(metric: LightQualityMetric): boolean {
  return LIGHT_QUALITY_VALIDATION[metric].claimPolicy !== 'not-a-standard-score';
}
