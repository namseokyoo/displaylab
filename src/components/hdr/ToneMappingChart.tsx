import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartColors } from '@/lib/chart-theme';
import { acesToneMap, hableToneMap, reinhardToneMap, toneMapCurve } from '@/lib/hdr';

interface ToneMapPoint {
  input: number;
  output: number;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function buildToneMapData(maxLuminance: number): {
  reinhard: ToneMapPoint[];
  hable: ToneMapPoint[];
  aces: ToneMapPoint[];
} {
  const safeMax = Math.max(maxLuminance, 1);

  const reinhard = toneMapCurve(
    (input, peak) => clamp01(reinhardToneMap(input, peak)),
    safeMax,
    512,
  );
  const hable = toneMapCurve(
    (input, peak) => clamp01(hableToneMap((input / Math.max(peak, 1)) * 12)),
    safeMax,
    512,
  );
  const aces = toneMapCurve(
    (input, peak) => clamp01(acesToneMap((input / Math.max(peak, 1)) * 4)),
    safeMax,
    512,
  );

  return { reinhard, hable, aces };
}

export default function ToneMappingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [targetPeak, setTargetPeak] = useState(1000);
  const { isDark } = useTheme();
  const colors = useMemo(() => getChartColors(isDark), [isDark]);

  const curves = useMemo(() => buildToneMapData(targetPeak), [targetPeak]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    if (containerWidth <= 0) return;

    const height = 350;
    const margin = { top: 18, right: 24, bottom: 50, left: 58 };
    const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
    const innerHeight = Math.max(0, height - margin.top - margin.bottom);
    if (innerWidth <= 0 || innerHeight <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, targetPeak]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickSize(-innerHeight)
          .tickFormat(() => ''),
      )
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    root
      .append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat((value) => d3.format('~s')(Number(value))),
      )
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    root
      .append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    root
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Input Luminance (cd/m²)');

    root
      .append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Output (0-1 normalized)');

    const drawCurve = (data: ToneMapPoint[], stroke: string) => {
      root
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', stroke)
        .attr('stroke-width', 2)
        .attr(
          'd',
          d3
            .line<ToneMapPoint>()
            .x((point) => xScale(point.input))
            .y((point) => yScale(point.output))
            .curve(d3.curveMonotoneX),
        );
    };

    drawCurve(curves.reinhard, '#ef4444');
    drawCurve(curves.hable, '#22c55e');
    drawCurve(curves.aces, '#3b82f6');

    const legend = root
      .append('g')
      .attr('transform', `translate(${Math.max(innerWidth - 128, 0)}, 8)`);
    const legendItems = [
      { label: 'Reinhard', color: '#ef4444' },
      { label: 'Hable', color: '#22c55e' },
      { label: 'ACES', color: '#3b82f6' },
    ];

    legendItems.forEach((item, index) => {
      const y = index * 18;
      legend
        .append('line')
        .attr('x1', 0)
        .attr('x2', 16)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', item.color)
        .attr('stroke-width', 2);

      legend
        .append('text')
        .attr('x', 22)
        .attr('y', y + 4)
        .attr('fill', colors.legendText)
        .attr('font-size', 11)
        .text(item.label);
    });
  }, [colors, containerWidth, curves.aces, curves.hable, curves.reinhard, targetPeak]);

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">Target Display Peak: {targetPeak} nits</span>
        <input
          type="range"
          min={100}
          max={4000}
          step={50}
          value={targetPeak}
          onChange={(event) => setTargetPeak(Number(event.currentTarget.value))}
          className="w-full accent-blue-500"
        />
      </label>

      <div
        ref={containerRef}
        className="w-full rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900"
      >
        <svg ref={svgRef} className="h-auto w-full" />
      </div>
    </div>
  );
}
