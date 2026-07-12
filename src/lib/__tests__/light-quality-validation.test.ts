import { describe, expect, it } from 'vitest';
import {
  LIGHT_QUALITY_VALIDATION,
  calculateCRI,
  calculateTLCI,
  calculateTM30,
  dIlluminantSPD,
  illuminantA_SPD,
  isStandardsValidated,
} from '../cri';
import oracleSpds from '../cri/data/oracle-spds.json';

describe('light-quality accuracy claim gate', () => {
  it.each(['cri', 'tm30', 'tlci'] as const)('%s fails closed until standards validation passes', (metric) => {
    expect(isStandardsValidated(metric)).toBe(false);
    expect(LIGHT_QUALITY_VALIDATION[metric].status).toBe('experimental');
    expect(LIGHT_QUALITY_VALIDATION[metric].blockingGaps.length).toBeGreaterThan(0);
  });

  it('pins the current TM-30 target edition separately from the legacy numerical probe', () => {
    expect(LIGHT_QUALITY_VALIDATION.tm30.reference).toBe('ANSI/IES TM-30-24');
    expect(LIGHT_QUALITY_VALIDATION.tm30.blockingGaps.join(' ')).toContain('TM-30-18');
  });

  it.each([
    ['A', illuminantA_SPD()],
    ['D65', dIlluminantSPD(6504)],
  ])('%s reference identity is stable', (_name, spectrum) => {
    expect(calculateCRI(spectrum).Ra).toBeCloseTo(100, 1);
    expect(calculateTM30(spectrum).Rf).toBeCloseTo(100, 1);
    expect(calculateTM30(spectrum).Rg).toBeCloseTo(100, 1);
    expect(calculateTLCI(spectrum).Qa).toBeCloseTo(100, 1);
  });

  it.each([
    ['FL2', 64.23372412166479],
    ['FL11', 82.85914684327928],
  ] as const)('%s CRI stays within the predeclared +/- 1.0 oracle tolerance', (name, expectedRa) => {
    expect(Math.abs(calculateCRI(oracleSpds[name]).Ra - expectedRa)).toBeLessThanOrEqual(1);
  });

  it('keeps the corrected CRI result near the official FL2 oracle', () => {
    expect(LIGHT_QUALITY_VALIDATION.cri.blockingGaps.join(' ')).not.toContain('TCS reflectance data is approximate');
    expect(calculateCRI(oracleSpds.FL2).Ra).toBeCloseTo(64.2, 1);
  });
});
