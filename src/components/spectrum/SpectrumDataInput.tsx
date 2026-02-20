import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import type { SpectrumPoint } from '@/types';
import {
  PRESETS,
  createSampleData,
  generateGaussianSpectrum,
  getExampleFormat,
  interpolateToVisibleRange,
  normalizeSpectrum,
  parseAndValidateClipboard,
  parseSpectrumFile,
  type PresetKey,
} from '@/lib/spectrum';

interface SpectrumDataInputProps {
  onDataLoaded: (data: SpectrumPoint[]) => void;
}

type InputTab = 'preset' | 'file' | 'paste';

const EXTENSIONS = ['.csv', '.tsv', '.txt'];

const CUSTOM_PRESETS: Array<{ key: string; name: string; peak: number; fwhm: number }> = [
  { key: 'laser-450', name: 'Laser Blue (450nm)', peak: 450, fwhm: 4 },
  { key: 'laser-532', name: 'Laser Green (532nm)', peak: 532, fwhm: 5 },
  { key: 'amber-590', name: 'Amber (590nm)', peak: 590, fwhm: 18 },
];

function getInputWarnings(rawData: SpectrumPoint[]): string[] {
  if (rawData.length === 0) return [];

  const warnings: string[] = [];
  const wavelengths = rawData.map((point) => point.wavelength);
  const minWavelength = Math.min(...wavelengths);
  const maxWavelength = Math.max(...wavelengths);

  if (minWavelength > 380 || maxWavelength < 780) {
    warnings.push('Input does not fully cover 380-780nm; edge regions may be filled with zeros after interpolation.');
  }

  if (rawData.length < 20) {
    warnings.push('Data point count is low; analysis accuracy may be reduced.');
  }

  return warnings;
}

function processSpectrum(rawData: SpectrumPoint[]): SpectrumPoint[] {
  const normalized = normalizeSpectrum(rawData);
  return interpolateToVisibleRange(normalized);
}

export default function SpectrumDataInput({ onDataLoaded }: SpectrumDataInputProps) {
  const [activeTab, setActiveTab] = useState<InputTab>('preset');
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exampleFormat = useMemo(() => getExampleFormat(), []);

  const applyData = useCallback((rawData: SpectrumPoint[], extraWarnings: string[] = []) => {
    if (rawData.length === 0) {
      setError('No valid spectrum data points were found.');
      return;
    }

    const processed = processSpectrum(rawData);
    if (processed.length === 0) {
      setError('Spectrum processing failed.');
      return;
    }

    setError(null);
    setWarnings(extraWarnings);
    onDataLoaded(processed);
  }, [onDataLoaded]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const dotIndex = file.name.lastIndexOf('.');
    const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';

    if (!EXTENSIONS.includes(extension)) {
      setError('Only CSV, TSV, or TXT files are supported.');
      setWarnings([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const rawData = await parseSpectrumFile(file);
      const autoWarnings = getInputWarnings(rawData);
      applyData(rawData, autoWarnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while parsing the file.');
    } finally {
      setIsLoading(false);
    }
  }, [applyData]);

  const handlePasteApply = useCallback(() => {
    if (!pasteText.trim()) {
      setError('Paste spectrum data first.');
      setWarnings([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    const result = parseAndValidateClipboard(pasteText);
    if (!result.valid) {
      setError(result.errors.join(' / '));
      setWarnings(result.warnings);
      setIsLoading(false);
      return;
    }

    const autoWarnings = getInputWarnings(result.data);
    applyData(result.data, [...result.warnings, ...autoWarnings]);
    setIsLoading(false);
  }, [applyData, pasteText]);

  const handlePresetSelect = useCallback((key: PresetKey) => {
    const rawData = PRESETS[key].data;
    applyData(rawData);
  }, [applyData]);

  const handleGeneratedPresetSelect = useCallback((peak: number, fwhm: number) => {
    const rawData = generateGaussianSpectrum(peak, fwhm);
    applyData(rawData);
  }, [applyData]);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    void handleFileSelect(event.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleReadClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPasteText(text);
      setError(null);
    } catch {
      setError('Clipboard access is unavailable. Please paste data manually.');
    }
  }, []);

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Spectrum Data Input</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Load spectrum data from file upload, clipboard paste, or built-in presets.
      </p>

      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preset'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'file'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'paste'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Paste
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          {warnings.map((warning) => (
            <p key={warning}>• {warning}</p>
          ))}
        </div>
      )}

      {activeTab === 'preset' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Built-in presets</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handlePresetSelect(key as PresetKey)}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-700"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Generated Gaussian presets</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CUSTOM_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.key}
                  onClick={() => handleGeneratedPresetSelect(preset.peak, preset.fwhm)}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-700"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-blue-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(event: ChangeEvent<HTMLInputElement>) => void handleFileSelect(event.target.files)}
              className="hidden"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Drag a file here or click to upload</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Supported formats: CSV, TSV, TXT</p>
          </div>
          {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Processing spectrum data...</p>}
        </div>
      )}

      {activeTab === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            className="h-44 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder={exampleFormat}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePasteApply}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              Apply Data
            </button>
            <button
              type="button"
              onClick={handleReadClipboard}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Read Clipboard
            </button>
            <button
              type="button"
              onClick={() => setPasteText(createSampleData())}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sample Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
