import { describe, expect, it } from 'vitest';
import {
  analyzeHDR10,
  buildHDRShareUrl,
  validateHDR10Metadata,
  type HDR10Metadata,
} from '@/lib/hdr';

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

  it.each([
    { maxCLL: Number.NaN },
    { maxCLL: 0 },
    { maxFALL: -1 },
    { masterDisplayMaxLuminance: Number.POSITIVE_INFINITY },
    { masterDisplayMinLuminance: Number.NaN },
  ])('rejects non-finite or out-of-range luminance metadata: %o', (override) => {
    expect(validateHDR10Metadata({ ...validMetadata, ...override })).toContain(
      'invalidLuminanceRange',
    );
  });
});

describe('analyzeHDR10', () => {
  it('analyzes valid metadata', () => {
    expect(analyzeHDR10(validMetadata).hdr10Grade).toBe('Premium');
  });

  it('fails closed for invalid metadata', () => {
    expect(() => analyzeHDR10({ ...validMetadata, maxFALL: 1200 })).toThrow(
      /Invalid HDR10 metadata: maxFallExceedsMaxCll/,
    );
  });
});

describe('buildHDRShareUrl', () => {
  it('includes valid derived analysis', () => {
    const url = new URL(
      buildHDRShareUrl('https://displaylab.example', '/hdr-analyzer', validMetadata, analyzeHDR10(validMetadata)),
    );
    expect(url.searchParams.has('analysis')).toBe(true);
  });

  it('omits derived analysis when validation failed', () => {
    const invalid = { ...validMetadata, maxFALL: 1200 };
    const url = new URL(
      buildHDRShareUrl(
        'https://displaylab.example',
        '/hdr-analyzer',
        invalid,
        analyzeHDR10(validMetadata),
      ),
    );
    expect(url.searchParams.has('analysis')).toBe(false);
    expect(JSON.parse(url.searchParams.get('metadata') ?? '{}').maxFALL).toBe(1200);
  });
});
