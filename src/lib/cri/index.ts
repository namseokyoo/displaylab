/**
 * CRI / TLCI / TM-30 Light Quality Analysis Module
 *
 * Provides color rendering quality metrics for light sources based on SPD data.
 */

// CRI (CIE 13.3-1995)
export { calculateCRI, type CRIResult } from './cri-calculation';

// TLCI (EBU Tech 3355)
export { calculateTLCI, type TLCIResult } from './tlci-calculation';

// Experimental TM-30-style model (not ANSI/IES TM-30-24 compliant)
export { calculateTM30, type TM30Result } from './tm30-calculation';

export {
  LIGHT_QUALITY_VALIDATION,
  isStandardsValidated,
  type LightQualityMetric,
  type LightQualityValidation,
} from './validation';

// Reference data
export {
  planckianSPD,
  illuminantA_SPD,
  dIlluminantSPD,
  getReferenceIlluminant,
  TCS_REFLECTANCE,
  TCS_NAMES,
  TCS_SHORT_LABELS,
} from './cri-reference-illuminants';
