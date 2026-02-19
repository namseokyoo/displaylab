/**
 * Delta E Heatmap / Bar Chart Component
 *
 * Shows ΔE values per viewing angle as a color-coded bar chart.
 * - Green (ΔE < 1): Imperceptible
 * - Yellow (1 ≤ ΔE < 3): Noticeable
 * - Red (ΔE ≥ 3): Clearly visible
 *
 * Supports toggling between ΔE*ab (CIE76) and CIEDE2000.
 * JND threshold line at ΔE = 1.0.
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ViewingAngleData } from '@/types';

type DeltaEMode = 'CIE76' | 'CIEDE2000';

/** Get bar color based on ΔE value */
function getBarColor(de: number): string {
  if (de < 1) return '#22c55e'; // green
  if (de < 3) return '#eab308'; // yellow
  return '#ef4444'; // red
}

interface DeltaEHeatmapProps {
  data: ViewingAngleData[];
  comparisonData?: ViewingAngleData[];
  dataLabel?: string;
  comparisonLabel?: string;
  width?: number;
  height?: number;
}

export default function DeltaEHeatmap({
  data,
  comparisonData,
  dataLabel = 'Primary',
  comparisonLabel = 'Comparison',
  width = 500,
  height = 350,
}: DeltaEHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<DeltaEMode>('CIEDE2000');

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 50, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const getDeltaE = (d: ViewingAngleData) =>
      mode === 'CIE76' ? (d.deltaE_ab ?? 0) : (d.deltaE_2000 ?? 0);

    // Filter out 0-degree (ΔE=0)
    const filteredData = data.filter((d) => d.angle > 0);
    const filteredComparison = comparisonData?.filter((d) => d.angle > 0) ?? [];

    const allAngles = [
      ...new Set([
        ...filteredData.map((d) => d.angle),
        ...filteredComparison.map((d) => d.angle),
      ]),
    ].sort((a, b) => a - b);

    const hasComparison = filteredComparison.length > 0;

    // Scales
    const allDeltaE = [
      ...filteredData.map(getDeltaE),
      ...filteredComparison.map(getDeltaE),
    ];
    const maxDeltaE = Math.max(d3.max(allDeltaE) ?? 1, 3.5);

    const xScale = d3
      .scaleBand<number>()
      .domain(allAngles)
      .range([0, innerWidth])
      .padding(hasComparison ? 0.2 : 0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxDeltaE * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    const yTicks = yScale.ticks(5);
    g.selectAll('.grid-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 0.5);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => `${d}\u00B0`),
      )
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px');

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text('Viewing Angle');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(mode === 'CIE76' ? '\u0394E*ab' : '\u0394E\u2080\u2080');

    // --- JND threshold line ---
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(1.0))
      .attr('y2', yScale(1.0))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6,3')
      .attr('opacity', 0.6);

    g.append('text')
      .attr('x', innerWidth - 4)
      .attr('y', yScale(1.0) - 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#ef4444')
      .attr('font-size', '9px')
      .attr('opacity', 0.8)
      .text('JND (\u0394E=1)');

    // --- Bars ---
    const barWidth = hasComparison ? xScale.bandwidth() / 2 : xScale.bandwidth();

    // Primary bars
    filteredData.forEach((d) => {
      const de = getDeltaE(d);
      const xPos = xScale(d.angle);
      if (xPos === undefined) return;

      g.append('rect')
        .attr('x', xPos)
        .attr('y', yScale(de))
        .attr('width', barWidth)
        .attr('height', Math.max(0, innerHeight - yScale(de)))
        .attr('fill', getBarColor(de))
        .attr('fill-opacity', 0.85)
        .attr('rx', 2);

      // Value label on top
      g.append('text')
        .attr('x', xPos + barWidth / 2)
        .attr('y', yScale(de) - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#d1d5db')
        .attr('font-size', '8px')
        .text(de.toFixed(1));
    });

    // Comparison bars
    if (hasComparison) {
      filteredComparison.forEach((d) => {
        const de = getDeltaE(d);
        const xPos = xScale(d.angle);
        if (xPos === undefined) return;

        g.append('rect')
          .attr('x', xPos + barWidth)
          .attr('y', yScale(de))
          .attr('width', barWidth)
          .attr('height', Math.max(0, innerHeight - yScale(de)))
          .attr('fill', getBarColor(de))
          .attr('fill-opacity', 0.5)
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 1)
          .attr('rx', 2);

        g.append('text')
          .attr('x', xPos + barWidth * 1.5)
          .attr('y', yScale(de) - 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '8px')
          .text(de.toFixed(1));
      });
    }

    // --- Title ---
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d1d5db')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text(`Color Difference by Viewing Angle (${mode})`);

    // --- Color legend ---
    const legendG = g.append('g').attr('transform', `translate(0, ${innerHeight + 28})`);

    const legendItems = [
      { label: '\u0394E < 1 (Imperceptible)', color: '#22c55e' },
      { label: '1 \u2264 \u0394E < 3 (Noticeable)', color: '#eab308' },
      { label: '\u0394E \u2265 3 (Obvious)', color: '#ef4444' },
    ];

    legendItems.forEach((item, i) => {
      const x = i * (innerWidth / 3);
      legendG
        .append('rect')
        .attr('x', x)
        .attr('y', 0)
        .attr('width', 8)
        .attr('height', 8)
        .attr('fill', item.color)
        .attr('rx', 1);
      legendG
        .append('text')
        .attr('x', x + 12)
        .attr('y', 8)
        .attr('fill', '#6b7280')
        .attr('font-size', '8px')
        .text(item.label);
    });
  }, [data, comparisonData, dataLabel, comparisonLabel, width, height, mode]);

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-2 justify-end">
        <button
          onClick={() => setMode('CIE76')}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            mode === 'CIE76'
              ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
              : 'border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          ΔE*ab (CIE76)
        </button>
        <button
          onClick={() => setMode('CIEDE2000')}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            mode === 'CIEDE2000'
              ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
              : 'border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          CIEDE2000
        </button>
      </div>
      <div className="inline-block">
        <svg ref={svgRef} className="bg-gray-900 rounded-lg" />
      </div>
    </div>
  );
}
