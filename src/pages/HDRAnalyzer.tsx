import { useCallback, useMemo } from 'react';
import HDRAnalysisResults from '@/components/hdr/HDRAnalysisResults';
import HDR10MetadataInput from '@/components/hdr/HDR10MetadataInput';
import EOTFChart from '@/components/hdr/EOTFChart';
import ToneMappingChart from '@/components/hdr/ToneMappingChart';
import SEO from '@/components/common/SEO';
import ShareButton from '@/components/common/ShareButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { analyzeHDR10 } from '@/lib/hdr';
import { toolJsonLd } from '@/lib/seo-data';
import type { HDR10Metadata } from '@/lib/hdr';

const HDR10_BASIC_METADATA: HDR10Metadata = {
  maxCLL: 1000,
  maxFALL: 400,
  masterDisplayMaxLuminance: 1000,
  masterDisplayMinLuminance: 0.005,
  primaryR: { x: 0.708, y: 0.292 },
  primaryG: { x: 0.17, y: 0.797 },
  primaryB: { x: 0.131, y: 0.046 },
  whitePoint: { x: 0.3127, y: 0.329 },
};

function cloneDefaultMetadata() {
  return {
    ...HDR10_BASIC_METADATA,
    primaryR: { ...HDR10_BASIC_METADATA.primaryR },
    primaryG: { ...HDR10_BASIC_METADATA.primaryG },
    primaryB: { ...HDR10_BASIC_METADATA.primaryB },
    whitePoint: { ...HDR10_BASIC_METADATA.whitePoint },
  };
}

export default function HDRAnalyzer() {
  const [metadata, setMetadata] = useLocalStorage(
    'displaylab::hdr::metadata',
    cloneDefaultMetadata(),
  );

  const analysisResult = useMemo(() => analyzeHDR10(metadata), [metadata]);

  const getShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('metadata', JSON.stringify(metadata));
    params.set('analysis', JSON.stringify(analysisResult));

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [analysisResult, metadata]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="HDR Analyzer - Display Lab"
        description="Visualize PQ/HLG EOTF curves, compare tone mapping algorithms, and analyze HDR10 metadata including peak brightness and dynamic range."
        keywords="HDR analyzer, HDR10 metadata, PQ EOTF, HLG curve, tone mapping, reinhard, ACES, display analysis"
        path="/hdr-analyzer"
        jsonLd={toolJsonLd(
          'HDR Analyzer',
          'Visualize PQ/HLG EOTF curves, compare tone mapping algorithms, and analyze HDR10 metadata including peak brightness and dynamic range.',
          '/hdr-analyzer',
        )}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HDR Analyzer</h1>
          <ShareButton getShareUrl={getShareUrl} />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Visualize HDR transfer functions and evaluate HDR10 metadata quality for mastering and
          playback targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <HDR10MetadataInput value={metadata} onChange={setMetadata} />
          <HDRAnalysisResults result={analysisResult} />
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              EOTF Curves
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Compare PQ, HLG, and SDR gamma response against display luminance.
            </p>
            <EOTFChart />
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Tone Mapping Curves
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Compare Reinhard, Hable, and ACES operators from HDR luminance to normalized output.
            </p>
            <ToneMappingChart />
          </div>
        </div>
      </div>
    </div>
  );
}
