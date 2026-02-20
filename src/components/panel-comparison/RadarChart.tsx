/**
 * Radar Chart Component
 *
 * D3.js radar (spider) chart for side-by-side panel technology comparison.
 * Renders selected panels only and adapts to dark/light chart theme.
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartColors } from '@/lib/chart-theme';
import { SPEC_LABELS } from '@/data/panel-technologies';
import type { PanelTechnology } from '@/data/panel-technologies';

interface RadarChartProps {
  panels: PanelTechnology[];
}

const GRID_LEVELS = [2, 4, 6, 8, 10];

export default function RadarChart({ panels }: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState(420);
  const { isDark } = useTheme();
  const chartColors = getChartColors(isDark);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextSize = Math.max(280, Math.min(520, entry.contentRect.width));
        setSize(nextSize);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${size} ${size}`).attr('width', '100%').attr('height', '100%');

    if (panels.length === 0) {
      svg
        .append('text')
        .attr('x', size / 2)
        .attr('y', size / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', chartColors.axisLabel)
        .attr('font-size', 14)
        .text('Select at least one panel technology');
      return;
    }

    const margin = 80;
    const radius = size / 2 - margin;
    const axisCount = SPEC_LABELS.length;
    const angleStep = (Math.PI * 2) / axisCount;
    const scoreScale = d3.scaleLinear().domain([0, 10]).range([0, radius]);

    const root = svg.append('g').attr('transform', `translate(${size / 2}, ${size / 2})`);

    GRID_LEVELS.forEach((level) => {
      root
        .append('circle')
        .attr('r', scoreScale(level))
        .attr('fill', 'none')
        .attr('stroke', chartColors.grid)
        .attr('stroke-width', 1);

      root
        .append('text')
        .attr('x', 0)
        .attr('y', -scoreScale(level) - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', chartColors.axisLabel)
        .attr('font-size', 10)
        .text(`${level}`);
    });

    SPEC_LABELS.forEach((spec, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = scoreScale(10) * Math.cos(angle);
      const y = scoreScale(10) * Math.sin(angle);

      root
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', chartColors.axis)
        .attr('stroke-width', 1);

      const labelX = (scoreScale(10) + 25) * Math.cos(angle);
      const labelY = (scoreScale(10) + 25) * Math.sin(angle);
      const anchor = labelX > 8 ? 'start' : labelX < -8 ? 'end' : 'middle';

      root
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'middle')
        .attr('fill', chartColors.axisLabel)
        .attr('font-size', 11)
        .text(spec.label);
    });

    const polygonLine = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveLinearClosed);

    panels.forEach((panel) => {
      const points = SPEC_LABELS.map((spec, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const score = panel.specs[spec.key];
        const r = scoreScale(score);
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      root
        .append('path')
        .datum(points)
        .attr('d', polygonLine)
        .attr('fill', panel.color)
        .attr('fill-opacity', 0.16)
        .attr('stroke', panel.color)
        .attr('stroke-width', 2);

      root
        .selectAll(`.point-${panel.id}`)
        .data(points)
        .enter()
        .append('circle')
        .attr('class', `point-${panel.id}`)
        .attr('cx', (d) => d[0])
        .attr('cy', (d) => d[1])
        .attr('r', 3)
        .attr('fill', panel.color)
        .attr('stroke', chartColors.background)
        .attr('stroke-width', 1);
    });
  }, [chartColors.axis, chartColors.axisLabel, chartColors.background, chartColors.grid, panels, size]);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="w-full aspect-square max-w-lg mx-auto">
        <svg ref={svgRef} className="w-full h-full" role="img" aria-label="Panel technology radar chart" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: panel.color }} />
            <span>{panel.shortName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
