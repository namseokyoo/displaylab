interface SpectrumResultsProps {
  cct?: number;
  duv?: number;
  dominantWavelength?: number;
  purity?: number;
  peakWavelength?: number;
  fwhm?: number;
  hexColor?: string;
}

function formatNumber(value?: number, digits: number = 1): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return value.toFixed(digits);
}

function formatDuv(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(4)}`;
}

function formatPurity(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  const normalized = value <= 1 ? value * 100 : value;
  return normalized.toFixed(1);
}

function getHexColor(hexColor?: string): string | null {
  if (!hexColor) return null;
  const trimmed = hexColor.trim();
  const validHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return validHex.test(trimmed) ? trimmed.toUpperCase() : null;
}

function ResultCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700/60 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
        {value}
        {value !== '--' && unit ? <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function SpectrumResults({
  cct,
  duv,
  dominantWavelength,
  purity,
  peakWavelength,
  fwhm,
  hexColor,
}: SpectrumResultsProps) {
  const resolvedHex = getHexColor(hexColor);

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Spectrum Analysis Results</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Chromaticity and spectral metrics calculated from the loaded spectrum.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard label="CCT" value={formatNumber(cct, 0)} unit="K" />
        <ResultCard label="Duv" value={formatDuv(duv)} />
        <ResultCard label="Dominant Wavelength" value={formatNumber(dominantWavelength, 1)} unit="nm" />
        <ResultCard label="Purity" value={formatPurity(purity)} unit="%" />
        <ResultCard label="Peak Wavelength" value={formatNumber(peakWavelength, 1)} unit="nm" />
        <ResultCard label="FWHM" value={formatNumber(fwhm, 1)} unit="nm" />
      </div>

      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700/60 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Color</p>
        <div className="mt-2 flex items-center gap-3">
          <span
            className="h-8 w-8 rounded-md border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: resolvedHex ?? 'transparent' }}
          />
          <span className="font-mono text-sm text-gray-900 dark:text-white">{resolvedHex ?? '--'}</span>
        </div>
      </div>
    </div>
  );
}
