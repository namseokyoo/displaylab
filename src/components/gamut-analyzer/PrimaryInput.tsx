/**
 * PrimaryInput Component
 *
 * R/G/B CIE xy coordinate input form with:
 * - Real-time validation (0-1 range)
 * - Standard gamut preset dropdown
 * - Device preset dropdown
 */

import { useState, useCallback } from 'react';
import { STANDARD_GAMUTS } from '@/data/gamut-primaries';
import { GAMUT_PRESETS } from '@/data/presets/gamut-samples';
import { useTranslation } from '@/lib/i18n';
import type { GamutData } from '@/types';

interface PrimaryInputProps {
  value: GamutData;
  onChange: (data: GamutData) => void;
  label?: string;
  color?: string;
}

type PrimaryKey = 'red' | 'green' | 'blue';

function isValidCoord(val: string): boolean {
  if (val === '' || val === '-') return true; // Allow empty / typing
  const n = parseFloat(val);
  return !isNaN(n) && n >= 0 && n <= 1;
}

function CoordInput({
  label,
  accessibleLabel,
  value,
  onChange,
  error,
  errorMessage,
  accentColor,
}: {
  label: string;
  accessibleLabel: string;
  value: string;
  onChange: (v: string) => void;
  error: boolean;
  errorMessage: string;
  accentColor: string;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="w-4 shrink-0 text-xs text-gray-500">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={accessibleLabel}
        aria-invalid={error}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 w-full rounded border bg-gray-50 px-2 py-1 font-mono text-base text-gray-800 dark:bg-gray-800 dark:text-gray-200 sm:min-h-0 sm:text-sm
          focus:outline-none focus:ring-1 transition-colors
          ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : `border-gray-300 dark:border-gray-700 focus:ring-${accentColor}-500 focus:border-${accentColor}-500`
          }`}
        placeholder="0.000"
      />
      {error && <span className="sr-only">{errorMessage}</span>}
    </label>
  );
}

export default function PrimaryInput({
  value,
  onChange,
  label,
  color = '#3b82f6',
}: PrimaryInputProps) {
  const { t } = useTranslation();
  // Local string state for controlled inputs (allows partial typing like "0.")
  const [localValues, setLocalValues] = useState<Record<PrimaryKey, { x: string; y: string }>>({
    red: { x: value.primaries.red.x.toFixed(4), y: value.primaries.red.y.toFixed(4) },
    green: { x: value.primaries.green.x.toFixed(4), y: value.primaries.green.y.toFixed(4) },
    blue: { x: value.primaries.blue.x.toFixed(4), y: value.primaries.blue.y.toFixed(4) },
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleCoordChange = useCallback(
    (primary: PrimaryKey, coord: 'x' | 'y', val: string) => {
      const newLocal = {
        ...localValues,
        [primary]: { ...localValues[primary], [coord]: val },
      };
      setLocalValues(newLocal);

      // Validate
      const errKey = `${primary}_${coord}`;
      const valid = isValidCoord(val);
      setErrors((prev) => ({ ...prev, [errKey]: !valid }));

      // Parse and propagate if valid number
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        const newPrimaries = { ...value.primaries };
        newPrimaries[primary] = {
          ...newPrimaries[primary],
          [coord]: parsed,
        };
        onChange({ ...value, primaries: newPrimaries });
      }
    },
    [localValues, onChange, value],
  );

  const applyPreset = useCallback(
    (primaries: GamutData['primaries'], name?: string) => {
      setLocalValues({
        red: { x: primaries.red.x.toFixed(4), y: primaries.red.y.toFixed(4) },
        green: { x: primaries.green.x.toFixed(4), y: primaries.green.y.toFixed(4) },
        blue: { x: primaries.blue.x.toFixed(4), y: primaries.blue.y.toFixed(4) },
      });
      setErrors({});
      onChange({
        ...value,
        name: name ?? value.name,
        primaries,
      });
    },
    [onChange, value],
  );

  const handleNameChange = useCallback(
    (name: string) => {
      onChange({ ...value, name });
    },
    [onChange, value],
  );

  const primaryConfig: { key: PrimaryKey; label: string; accent: string; dotColor: string }[] = [
    { key: 'red', label: 'R', accent: 'red', dotColor: '#ef4444' },
    { key: 'green', label: 'G', accent: 'green', dotColor: '#22c55e' },
    { key: 'blue', label: 'B', accent: 'blue', dotColor: '#3b82f6' },
  ];

  return (
    <div className="space-y-3">
      {/* Header with name and color indicator */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        {label ? (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        ) : (
          <input
            type="text"
            value={value.name}
            onChange={(e) => handleNameChange(e.target.value)}
            aria-label={t('gamut.displayName')}
            className="min-h-11 min-w-0 flex-1 border-b border-gray-300 bg-transparent text-base font-medium text-gray-700 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:text-gray-300 sm:min-h-0 sm:text-sm"
            placeholder={t('gamut.displayName')}
          />
        )}
      </div>

      {/* Preset dropdowns */}
      <div className="flex gap-2 w-full min-w-0">
        <select
          onChange={(e) => {
            const std = STANDARD_GAMUTS[e.target.value];
            if (std) applyPreset(std.primaries, std.name);
            e.target.value = '';
          }}
          value=""
          className="min-h-11 min-w-0 flex-1 truncate rounded border border-gray-300 bg-gray-50 px-2 py-1 text-base text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:min-h-0 sm:text-xs"
        >
          <option value="">{t('gamut.standardGamut')}</option>
          {Object.entries(STANDARD_GAMUTS).map(([key, g]) => (
            <option key={key} value={key}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            const preset = GAMUT_PRESETS[idx];
            if (preset) applyPreset(preset.primaries, preset.name);
            e.target.value = '';
          }}
          value=""
          className="min-h-11 min-w-0 flex-1 truncate rounded border border-gray-300 bg-gray-50 px-2 py-1 text-base text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:min-h-0 sm:text-xs"
        >
          <option value="">{t('gamut.devicePreset')}</option>
          {GAMUT_PRESETS.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Primary coordinate inputs */}
      <div className="grid grid-cols-3 gap-3">
        {primaryConfig.map(({ key, label: pLabel, accent, dotColor }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{pLabel}</span>
            </div>
            <CoordInput
              label="x"
              accessibleLabel={`${key} x`}
              value={localValues[key].x}
              onChange={(v) => handleCoordChange(key, 'x', v)}
              error={!!errors[`${key}_x`]}
              errorMessage={t('common.invalid')}
              accentColor={accent}
            />
            <CoordInput
              label="y"
              accessibleLabel={`${key} y`}
              value={localValues[key].y}
              onChange={(v) => handleCoordChange(key, 'y', v)}
              error={!!errors[`${key}_y`]}
              errorMessage={t('common.invalid')}
              accentColor={accent}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
