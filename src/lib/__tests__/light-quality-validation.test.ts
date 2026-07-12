import { describe, expect, it } from 'vitest';
import {
  LIGHT_QUALITY_VALIDATION,
  calculateCRI,
  dIlluminantSPD,
  illuminantA_SPD,
  isMetricAvailable,
  isStandardsValidated,
} from '../cri';
import * as lightQuality from '../cri';
import oracleSpds from '../cri/data/oracle-spds.json';
import criDomainHoldouts from '../cri/data/cri-domain-holdouts.json';

describe('light-quality accuracy claim gate', () => {
  it.each(['cri', 'tm30', 'tlci'] as const)('%s fails closed until standards validation passes', (metric) => {
    expect(isStandardsValidated(metric)).toBe(false);
    expect(LIGHT_QUALITY_VALIDATION[metric].blockingGaps.length).toBeGreaterThan(0);
  });

  it('exposes only the narrowed general CRI Ra calculation', () => {
    expect(LIGHT_QUALITY_VALIDATION.cri.status).toBe('experimental');
    expect(LIGHT_QUALITY_VALIDATION.cri.availability).toBe('ra-only');
    expect(isMetricAvailable('cri')).toBe(true);
    expect('calculateTM30' in lightQuality).toBe(false);
    expect('calculateTLCI' in lightQuality).toBe(false);
  });

  it.each(['tm30', 'tlci'] as const)('%s remains disabled in the public contract', (metric) => {
    expect(LIGHT_QUALITY_VALIDATION[metric].status).toBe('disabled');
    expect(LIGHT_QUALITY_VALIDATION[metric].availability).toBe('disabled');
    expect(isMetricAvailable(metric)).toBe(false);
  });

  it('pins the current TM-30 target edition', () => {
    expect(LIGHT_QUALITY_VALIDATION.tm30.reference).toBe('ANSI/IES TM-30-24');
    expect(LIGHT_QUALITY_VALIDATION.tm30.blockingGaps.join(' ')).toContain('legally reusable');
  });

  it.each([
    ['A', illuminantA_SPD()],
    ['D65', dIlluminantSPD(6504)],
  ])('%s reference identity is stable', (_name, spectrum) => {
    expect(calculateCRI(spectrum).Ra).toBeCloseTo(100, 1);
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

  it.each(criDomainHoldouts.fixtures)(
    '$name Ra stays within the predeclared CRI domain tolerance',
    (fixture) => {
      const result = calculateCRI(fixture.spectrum);

      expect(Math.abs(result.Ra - fixture.Ra)).toBeLessThanOrEqual(1);
    },
  );

  it('withholds individual Ri values from the runtime result', () => {
    expect(calculateCRI(oracleSpds.FL2)).not.toHaveProperty('Ri');
  });

  it.each([
    ['empty input', []],
    ['zero energy', [{ wavelength: 380, intensity: 0 }, { wavelength: 780, intensity: 0 }]],
    ['energy only outside the analysis range', [
      { wavelength: 380, intensity: 0 },
      { wavelength: 780, intensity: 0 },
      { wavelength: 1000, intensity: 1 },
    ]],
    ['overflowing analysis energy', [
      { wavelength: 380, intensity: Number.MAX_VALUE },
      { wavelength: 780, intensity: Number.MAX_VALUE },
    ]],
    ['incomplete coverage', [{ wavelength: 400, intensity: 1 }, { wavelength: 700, intensity: 1 }]],
    ['negative intensity', [{ wavelength: 380, intensity: 1 }, { wavelength: 780, intensity: -1 }]],
    ['duplicate wavelength', [
      { wavelength: 380, intensity: 1 },
      { wavelength: 380, intensity: 0.5 },
      { wavelength: 780, intensity: 1 },
    ]],
  ])('rejects %s instead of producing a CRI value', (_name, spectrum) => {
    expect(() => calculateCRI(spectrum)).toThrow();
  });
});
