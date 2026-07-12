/**
 * Claim-safe light quality analysis module.
 *
 * Provides color rendering quality metrics for light sources based on SPD data.
 */

// CRI (CIE 13.3-1995)
export { calculateCRI, type CRIResult } from './cri-calculation';

export {
  LIGHT_QUALITY_VALIDATION,
  isMetricAvailable,
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
} from './cri-reference-illuminants';
