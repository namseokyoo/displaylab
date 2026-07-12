import { validateHDR10Metadata, type HDR10Metadata, type HDRAnalysisResult } from './hdr-analysis';

/** Build a share URL without serializing derived results from invalid input. */
export function buildHDRShareUrl(
  origin: string,
  pathname: string,
  metadata: HDR10Metadata,
  analysis: HDRAnalysisResult | null,
): string {
  const params = new URLSearchParams();
  params.set('metadata', JSON.stringify(metadata));
  if (analysis !== null && validateHDR10Metadata(metadata).length === 0) {
    params.set('analysis', JSON.stringify(analysis));
  }
  return `${origin}${pathname}?${params.toString()}`;
}
