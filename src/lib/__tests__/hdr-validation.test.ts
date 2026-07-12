import { describe, expect, it } from 'vitest';
import { validateHDR10Metadata, type HDR10Metadata } from '@/lib/hdr';

const validMetadata: HDR10Metadata = {
  maxCLL: 1000,
  maxFALL: 400,
  masterDisplayMaxLuminance: 1000,
  masterDisplayMinLuminance: 0.005,
  primaryR: { x: 0.708, y: 0.292 },
  primaryG: { x: 0.17, y: 0.797 },
  primaryB: { x: 0.131, y: 0.046 },
  whitePoint: { x: 0.3127, y: 0.329 },
};

describe('validateHDR10Metadata', () => {
  it('accepts a valid HDR10 profile', () => {
    expect(validateHDR10Metadata(validMetadata)).toEqual([]);
  });

  it('rejects impossible chromaticity coordinates', () => {
    expect(validateHDR10Metadata({ ...validMetadata, primaryR: { x: 2, y: 0.2 } })).toContain(
      'chromaticity',
    );
  });

  it('rejects MaxFALL above MaxCLL', () => {
    expect(validateHDR10Metadata({ ...validMetadata, maxFALL: 1200 })).toContain(
      'maxFallExceedsMaxCll',
    );
  });

  it('rejects an inverted mastering luminance range', () => {
    expect(
      validateHDR10Metadata({
        ...validMetadata,
        masterDisplayMinLuminance: 1000,
      }),
    ).toContain('invalidLuminanceRange');
  });
});
