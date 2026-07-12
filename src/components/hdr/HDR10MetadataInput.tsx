import { validateHDR10Metadata, type HDR10Metadata } from '@/lib/hdr';
import { useTranslation } from '@/lib/i18n';

interface HDR10MetadataInputProps {
  value: HDR10Metadata;
  onChange: (metadata: HDR10Metadata) => void;
}

type NumericMetadataKey =
  | 'maxCLL'
  | 'maxFALL'
  | 'masterDisplayMaxLuminance'
  | 'masterDisplayMinLuminance';

type ChromaticityKey = 'primaryR' | 'primaryG' | 'primaryB' | 'whitePoint';

const BT2020_PRIMARIES = {
  primaryR: { x: 0.708, y: 0.292 },
  primaryG: { x: 0.17, y: 0.797 },
  primaryB: { x: 0.131, y: 0.046 },
} as const;

const D65_WHITE_POINT = { x: 0.3127, y: 0.329 };

const HDR10_BASIC_PRESET: HDR10Metadata = {
  maxCLL: 1000,
  maxFALL: 400,
  masterDisplayMaxLuminance: 1000,
  masterDisplayMinLuminance: 0.005,
  primaryR: { ...BT2020_PRIMARIES.primaryR },
  primaryG: { ...BT2020_PRIMARIES.primaryG },
  primaryB: { ...BT2020_PRIMARIES.primaryB },
  whitePoint: { ...D65_WHITE_POINT },
};

const HDR10_PLUS_PRESET: HDR10Metadata = {
  maxCLL: 4000,
  maxFALL: 1000,
  masterDisplayMaxLuminance: 4000,
  masterDisplayMinLuminance: 0.001,
  primaryR: { ...BT2020_PRIMARIES.primaryR },
  primaryG: { ...BT2020_PRIMARIES.primaryG },
  primaryB: { ...BT2020_PRIMARIES.primaryB },
  whitePoint: { ...D65_WHITE_POINT },
};

const DOLBY_VISION_PRESET: HDR10Metadata = {
  maxCLL: 10000,
  maxFALL: 1500,
  masterDisplayMaxLuminance: 10000,
  masterDisplayMinLuminance: 0.0001,
  primaryR: { ...BT2020_PRIMARIES.primaryR },
  primaryG: { ...BT2020_PRIMARIES.primaryG },
  primaryB: { ...BT2020_PRIMARIES.primaryB },
  whitePoint: { ...D65_WHITE_POINT },
};

function cloneMetadata(metadata: HDR10Metadata): HDR10Metadata {
  return {
    ...metadata,
    primaryR: { ...metadata.primaryR },
    primaryG: { ...metadata.primaryG },
    primaryB: { ...metadata.primaryB },
    whitePoint: { ...metadata.whitePoint },
  };
}

function parseNumericInput(rawValue: string): number {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isChromaticityInvalid(point: { x: number; y: number }): boolean {
  return (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < 0 ||
    point.x > 1 ||
    point.y < 0 ||
    point.y > 1 ||
    point.x + point.y > 1
  );
}

function NumericField({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  invalid = false,
}: {
  label: string;
  value: number;
  onValueChange: (rawValue: string) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  invalid?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        min={min}
        max={max}
        step={step ?? 'any'}
        aria-invalid={invalid}
        className={`min-h-11 rounded-lg border bg-white px-3 py-2 text-base text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white sm:text-sm ${
          invalid
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200 focus:border-blue-500 dark:border-gray-700'
        }`}
      />
    </label>
  );
}

export default function HDR10MetadataInput({ value, onChange }: HDR10MetadataInputProps) {
  const { t } = useTranslation();
  const issues = validateHDR10Metadata(value);
  const hasIssue = (issue: (typeof issues)[number]) => issues.includes(issue);
  const updateNumericField = (
    key: NumericMetadataKey,
    rawValue: string,
    min?: number,
    max?: number,
  ) => {
    let nextValue = parseNumericInput(rawValue);
    if (typeof min === 'number') nextValue = Math.max(min, nextValue);
    if (typeof max === 'number') nextValue = Math.min(max, nextValue);

    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const updateChromaticity = (key: ChromaticityKey, axis: 'x' | 'y', rawValue: string) => {
    const nextValue = parseNumericInput(rawValue);

    onChange({
      ...value,
      [key]: {
        ...value[key],
        [axis]: nextValue,
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('hdr.metadataTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('hdr.metadataDesc')}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => onChange(cloneMetadata(HDR10_BASIC_PRESET))}
          className="min-h-11 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
        >
          HDR10 Basic (1000 nits)
        </button>
        <button
          onClick={() => onChange(cloneMetadata(HDR10_PLUS_PRESET))}
          className="min-h-11 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors"
        >
          HDR10+ (4000 nits)
        </button>
        <button
          onClick={() => onChange(cloneMetadata(DOLBY_VISION_PRESET))}
          className="min-h-11 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
        >
          Dolby Vision (10000 nits)
        </button>
      </div>

      {issues.length > 0 && (
        <div
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          <p className="font-medium">{t('hdr.invalidMetadata')}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {hasIssue('chromaticity') && <li>{t('hdr.invalidChromaticity')}</li>}
            {hasIssue('maxFallExceedsMaxCll') && <li>{t('hdr.invalidMaxFall')}</li>}
            {hasIssue('invalidLuminanceRange') && <li>{t('hdr.invalidLuminanceRange')}</li>}
          </ul>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('hdr.luminanceMetadata')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericField
              label="MaxCLL (cd/m²)"
              value={value.maxCLL}
              min={0}
              max={10000}
              step={1}
              onValueChange={(rawValue) => updateNumericField('maxCLL', rawValue, 0, 10000)}
            />
            <NumericField
              label="MaxFALL (cd/m²)"
              value={value.maxFALL}
              min={0}
              max={10000}
              step={1}
              invalid={hasIssue('maxFallExceedsMaxCll')}
              onValueChange={(rawValue) => updateNumericField('maxFALL', rawValue, 0, 10000)}
            />
            <NumericField
              label="Master Display Max Luminance"
              value={value.masterDisplayMaxLuminance}
              min={0}
              step={1}
              invalid={hasIssue('invalidLuminanceRange')}
              onValueChange={(rawValue) =>
                updateNumericField('masterDisplayMaxLuminance', rawValue, 0)
              }
            />
            <NumericField
              label="Master Display Min Luminance"
              value={value.masterDisplayMinLuminance}
              min={0}
              step="any"
              invalid={hasIssue('invalidLuminanceRange')}
              onValueChange={(rawValue) =>
                updateNumericField('masterDisplayMinLuminance', rawValue, 0)
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('hdr.primaries')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericField
              label="Primary R x"
              value={value.primaryR.x}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryR)}
              onValueChange={(rawValue) => updateChromaticity('primaryR', 'x', rawValue)}
            />
            <NumericField
              label="Primary R y"
              value={value.primaryR.y}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryR)}
              onValueChange={(rawValue) => updateChromaticity('primaryR', 'y', rawValue)}
            />
            <NumericField
              label="Primary G x"
              value={value.primaryG.x}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryG)}
              onValueChange={(rawValue) => updateChromaticity('primaryG', 'x', rawValue)}
            />
            <NumericField
              label="Primary G y"
              value={value.primaryG.y}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryG)}
              onValueChange={(rawValue) => updateChromaticity('primaryG', 'y', rawValue)}
            />
            <NumericField
              label="Primary B x"
              value={value.primaryB.x}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryB)}
              onValueChange={(rawValue) => updateChromaticity('primaryB', 'x', rawValue)}
            />
            <NumericField
              label="Primary B y"
              value={value.primaryB.y}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.primaryB)}
              onValueChange={(rawValue) => updateChromaticity('primaryB', 'y', rawValue)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('hdr.whitePoint')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericField
              label="White Point x"
              value={value.whitePoint.x}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.whitePoint)}
              onValueChange={(rawValue) => updateChromaticity('whitePoint', 'x', rawValue)}
            />
            <NumericField
              label="White Point y"
              value={value.whitePoint.y}
              min={0}
              max={1}
              step="any"
              invalid={isChromaticityInvalid(value.whitePoint)}
              onValueChange={(rawValue) => updateChromaticity('whitePoint', 'y', rawValue)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
