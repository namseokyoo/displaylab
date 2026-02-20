/**
 * CCT Calculator Component
 *
 * CIE xy input -> CCT (K) + Duv output
 * With color temperature interpretation and illuminant presets.
 */

import { useState, useCallback } from 'react';
import { calculateCCT, calculateDuv, interpretCCT, CCT_PRESETS } from '@/lib/cct';

export default function CCTCalculator() {
  const [inputX, setInputX] = useState('0.3127');
  const [inputY, setInputY] = useState('0.3290');

  const parseNum = (s: string): number => {
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const getResult = useCallback(() => {
    const x = parseNum(inputX);
    const y = parseNum(inputY);

    if (y === 0 || x < 0 || x > 1 || y < 0 || y > 1) {
      return null;
    }

    const cct = calculateCCT(x, y);
    const duv = calculateDuv(x, y);
    const interpretation = interpretCCT(cct);

    return { cct, duv, interpretation };
  }, [inputX, inputY]);

  const loadPreset = (key: keyof typeof CCT_PRESETS) => {
    const preset = CCT_PRESETS[key];
    setInputX(preset.x.toFixed(4));
    setInputY(preset.y.toFixed(4));
  };

  const result = getResult();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warm':
        return 'text-orange-400';
      case 'neutral':
        return 'text-yellow-300';
      case 'cool':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">CCT Calculator</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Correlated Color Temperature + Duv from CIE xy
      </p>

      {/* Presets */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Presets</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CCT_PRESETS) as (keyof typeof CCT_PRESETS)[]).map((key) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="text-xs text-gray-500 dark:text-gray-400">CIE x</span>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="1"
            value={inputX}
            onChange={(e) => setInputX(e.target.value)}
            className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500 dark:text-gray-400">CIE y</span>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="1"
            value={inputY}
            onChange={(e) => setInputY(e.target.value)}
            className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Result */}
      {result && (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">CCT</div>
              <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                {result.cct.toFixed(0)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">K</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Duv</div>
              <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                {result.duv >= 0 ? '+' : ''}
                {result.duv.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/50">
            <div
              className={`text-sm font-medium ${getCategoryColor(result.interpretation.category)}`}
            >
              {result.interpretation.description}
            </div>
            {Math.abs(result.duv) > 0.006 && (
              <div className="text-xs text-gray-500 mt-1">
                Duv {result.duv > 0 ? '> 0: greenish tint' : '< 0: pinkish tint'}
              </div>
            )}
          </div>
        </div>
      )}

      {!result && (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 text-sm text-gray-400 dark:text-gray-500">
          Enter valid CIE xy coordinates (0-1 range)
        </div>
      )}
    </div>
  );
}
