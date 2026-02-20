/**
 * Delta E Calculator Component
 *
 * Two Lab color inputs -> simultaneous CIE76, CIE94, CIEDE2000 output.
 * Includes difference interpretation guide and preset color pairs.
 */

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { deltaE76, deltaE94, deltaE2000 } from '@/lib/delta-e';
import { useTranslation } from '@/lib/i18n';
import type { LabColor } from '@/types';

interface ColorPairPreset {
  name: string;
  lab1: LabColor;
  lab2: LabColor;
}

const PRESETS: ColorPairPreset[] = [
  {
    name: 'color.presetNearIdentical',
    lab1: { L: 50, a: 2.6772, b: -79.7751 },
    lab2: { L: 50, a: 0, b: -82.7485 },
  },
  {
    name: 'color.presetSubtle',
    lab1: { L: 60.2574, a: -34.0099, b: 36.2677 },
    lab2: { L: 60.4626, a: -34.1751, b: 39.4387 },
  },
  {
    name: 'color.presetNoticeable',
    lab1: { L: 50, a: 2.5, b: 0 },
    lab2: { L: 73, a: 25, b: -18 },
  },
  {
    name: 'color.presetLarge',
    lab1: { L: 50, a: 2.5, b: 0 },
    lab2: { L: 56, a: -27, b: -3 },
  },
];

/** Interpret Delta E value into translation key + color */
function interpretDeltaE(de: number): { levelKey: string; color: string } {
  if (de < 1.0) return { levelKey: 'color.deImperceptible', color: 'text-green-400' };
  if (de < 2.0) return { levelKey: 'color.deBarelyPerceptible', color: 'text-emerald-400' };
  if (de < 3.5) return { levelKey: 'color.deNoticeable', color: 'text-yellow-400' };
  if (de < 5.0) return { levelKey: 'color.deClearlyNoticeable', color: 'text-orange-400' };
  return { levelKey: 'color.deObvious', color: 'text-red-400' };
}

export default function DeltaECalculator() {
  const { t } = useTranslation();
  const [values, setValues] = useLocalStorage('displaylab::calc::deltae::values', {
    l1: '50.0000',
    a1: '2.6772',
    b1: '-79.7751',
    l2: '50.0000',
    a2: '0.0000',
    b2: '-82.7485',
  });
  const { l1, a1, b1, l2, a2, b2 } = values;

  const parseNum = (s: string): number => {
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const getResult = useCallback(() => {
    const lab1: LabColor = { L: parseNum(l1), a: parseNum(a1), b: parseNum(b1) };
    const lab2: LabColor = { L: parseNum(l2), a: parseNum(a2), b: parseNum(b2) };

    return {
      de76: deltaE76(lab1, lab2),
      de94: deltaE94(lab1, lab2),
      de2000: deltaE2000(lab1, lab2),
    };
  }, [l1, a1, b1, l2, a2, b2]);

  const loadPreset = (preset: ColorPairPreset) => {
    setValues({
      l1: preset.lab1.L.toFixed(4),
      a1: preset.lab1.a.toFixed(4),
      b1: preset.lab1.b.toFixed(4),
      l2: preset.lab2.L.toFixed(4),
      a2: preset.lab2.a.toFixed(4),
      b2: preset.lab2.b.toFixed(4),
    });
  };

  const result = getResult();
  const interpretation = interpretDeltaE(result.de2000);

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('color.deltaETitle')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('color.deltaESubtitle')}
      </p>

      {/* Presets */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('common.presets')}</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700"
            >
              {t(preset.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Two color inputs side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Color 1 */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{t('color.color1')}</div>
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">L*</span>
              <input
                type="number"
                step="any"
                value={l1}
                onChange={(e) => setValues({ ...values, l1: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">a*</span>
              <input
                type="number"
                step="any"
                value={a1}
                onChange={(e) => setValues({ ...values, a1: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">b*</span>
              <input
                type="number"
                step="any"
                value={b1}
                onChange={(e) => setValues({ ...values, b1: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* Color 2 */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{t('color.color2')}</div>
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">L*</span>
              <input
                type="number"
                step="any"
                value={l2}
                onChange={(e) => setValues({ ...values, l2: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">a*</span>
              <input
                type="number"
                step="any"
                value={a2}
                onChange={(e) => setValues({ ...values, a2: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400 dark:text-gray-500">b*</span>
              <input
                type="number"
                step="any"
                value={b2}
                onChange={(e) => setValues({ ...values, b2: e.target.value })}
                className="mt-0.5 block w-full px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-400 dark:text-gray-500">CIE76</div>
            <div className="text-base font-mono font-semibold text-gray-900 dark:text-white">
              {result.de76.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 dark:text-gray-500">CIE94</div>
            <div className="text-base font-mono font-semibold text-gray-900 dark:text-white">
              {result.de94.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 dark:text-gray-500">CIEDE2000</div>
            <div className="text-base font-mono font-semibold text-blue-400">
              {result.de2000.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700/50">
          <div className={`text-sm font-medium ${interpretation.color}`}>
            {t(interpretation.levelKey)}
          </div>
        </div>
      </div>

      {/* Reference guide */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/30 dark:border-gray-700/30">
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">{t('color.interpretGuide')}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-green-400">{t('color.deGuideImperceptible')}</div>
          <div className="text-emerald-400">{t('color.deGuideBarelyPerceptible')}</div>
          <div className="text-yellow-400">{t('color.deGuideNoticeable')}</div>
          <div className="text-orange-400">{t('color.deGuideClearlyNoticeable')}</div>
          <div className="text-red-400">{t('color.deGuideObvious')}</div>
        </div>
      </div>
    </div>
  );
}
