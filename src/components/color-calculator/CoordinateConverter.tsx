/**
 * Coordinate Converter Component
 *
 * Bidirectional XYZ <-> xyY real-time conversion.
 */

import { useState, useCallback } from 'react';
import { xyzToXY } from '@/lib/cie';
import { xyYToXYZ } from '@/lib/color-convert';

type Mode = 'xyz-to-xyY' | 'xyY-to-xyz';

export default function CoordinateConverter() {
  const [mode, setMode] = useState<Mode>('xyz-to-xyY');

  // XYZ inputs
  const [xyzX, setXyzX] = useState('95.047');
  const [xyzY, setXyzY] = useState('100.000');
  const [xyzZ, setXyzZ] = useState('108.883');

  // xyY inputs
  const [xyX, setXyX] = useState('0.3127');
  const [xyY, setXyY] = useState('0.3290');
  const [xyYY, setXyYY] = useState('100.000');

  const parseNum = (s: string): number => {
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const getXYZResult = useCallback(() => {
    const X = parseNum(xyzX);
    const Y = parseNum(xyzY);
    const Z = parseNum(xyzZ);
    const { x, y } = xyzToXY({ X, Y, Z });
    return { x, y, Y };
  }, [xyzX, xyzY, xyzZ]);

  const getXyYResult = useCallback(() => {
    const x = parseNum(xyX);
    const y = parseNum(xyY);
    const Y = parseNum(xyYY);
    const xyz = xyYToXYZ(x, y, Y);
    return xyz;
  }, [xyX, xyY, xyYY]);

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Coordinate Converter</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bidirectional XYZ &harr; xyY conversion</p>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'xyz-to-xyY'
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          onClick={() => setMode('xyz-to-xyY')}
        >
          XYZ &rarr; xyY
        </button>
        <button
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'xyY-to-xyz'
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          onClick={() => setMode('xyY-to-xyz')}
        >
          xyY &rarr; XYZ
        </button>
      </div>

      {mode === 'xyz-to-xyY' ? (
        <>
          {/* XYZ Input */}
          <div className="space-y-3 mb-4">
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">X</span>
              <input
                type="number"
                step="any"
                value={xyzX}
                onChange={(e) => setXyzX(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">Y (Luminance)</span>
              <input
                type="number"
                step="any"
                value={xyzY}
                onChange={(e) => setXyzY(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">Z</span>
              <input
                type="number"
                step="any"
                value={xyzZ}
                onChange={(e) => setXyzZ(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>

          {/* xyY Result */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Result: xyY</div>
            {(() => {
              const result = getXYZResult();
              return (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">x</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.x.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">y</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.y.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">Y</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.Y.toFixed(4)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      ) : (
        <>
          {/* xyY Input */}
          <div className="space-y-3 mb-4">
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">x</span>
              <input
                type="number"
                step="any"
                value={xyX}
                onChange={(e) => setXyX(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">y</span>
              <input
                type="number"
                step="any"
                value={xyY}
                onChange={(e) => setXyY(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 dark:text-gray-400">Y (Luminance)</span>
              <input
                type="number"
                step="any"
                value={xyYY}
                onChange={(e) => setXyYY(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>

          {/* XYZ Result */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Result: XYZ</div>
            {(() => {
              const result = getXyYResult();
              return (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">X</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.X.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">Y</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.Y.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">Z</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{result.Z.toFixed(4)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
