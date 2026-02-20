import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartColors } from '@/lib/chart-theme';
import { gammaEOTF, hlgEOTF, pqEOTF } from '@/lib/hdr';

type YScaleMode = 'linear' | 'log10';

interface CurvePoint {
  input: number;
  luminance: number;
}

interface TooltipData {
  x: number;
  y: number;
  input: number;
  pq: number;
  hlg: number;
  gamma: number;
}

const CURVE_STEPS = 512;
const SDR_REFERENCE_NITS = 100;
const MIN_LOG_LUMINANCE = 0.01;

function buildCurveData(hlgPeak: number): {
  pq: CurvePoint[];
  hlg: CurvePoint[];
  gamma: CurvePoint[];
  maxLuminance: number;
} {
  const pq: CurvePoint[] = [];
  const hlg: CurvePoint[] = [];
  const gamma: CurvePoint[] = [];

  let maxLuminance = 0;
  for (let index = 0; index < CURVE_STEPS; index += 1) {
    const input = index / (CURVE_STEPS - 1);
    const pqLuminance = pqEOTF(input);
    const hlgLuminance = hlgEOTF(input, hlgPeak);
    const gammaLuminance = gammaEOTF(input, 2.4) * SDR_REFERENCE_NITS;

    pq.push({ input, luminance: pqLuminance });
    hlg.push({ input, luminance: hlgLuminance });
    gamma.push({ input, luminance: gammaLuminance });

    maxLuminance = Math.max(maxLuminance, pqLuminance, hlgLuminance, gammaLuminance);
  }

  return { pq, hlg, gamma, maxLuminance };
}

export default function EOTFChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hlgPeak, setHlgPeak] = useState(1000);
  const [scaleMode, setScaleMode] = useState<YScaleMode>('linear');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const { isDark } = useTheme();
  const colors = useMemo(() => getChartColors(isDark), [isDark]);

  const curves = useMemo(() => buildCurveData(hlgPeak), [hlgPeak]);

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
    if (!svgRef.current || !containerRef.current) return;
    if (containerWidth <= 0) return;

    const height = 360;
    const margin = { top: 18, right: 24, bottom: 48, left: 64 };
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

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const yScaleLinear = d3
      .scaleLinear()
      .domain([0, Math.max(curves.maxLuminance * 1.02, 1)])
      .nice()
      .range([innerHeight, 0]);

    const logDomainMax = Math.max(curves.maxLuminance, MIN_LOG_LUMINANCE * 10);
    const yScaleLog = d3
      .scaleLog()
      .domain([MIN_LOG_LUMINANCE, logDomainMax])
      .range([innerHeight, 0]);

    const yPosition = (value: number) =>
      scaleMode === 'linear' ? yScaleLinear(value) : yScaleLog(Math.max(value, MIN_LOG_LUMINANCE));

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickSize(-innerHeight)
          .tickFormat(() => ''),
      )
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    const yGridAxis =
      scaleMode === 'linear'
        ? d3
            .axisLeft(yScaleLinear)
            .ticks(6)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        : d3
            .axisLeft(yScaleLog)
            .tickValues(
              [0.01, 0.1, 1, 10, 100, 1000, 10000].filter((value) => value <= logDomainMax),
            )
            .tickSize(-innerWidth)
            .tickFormat(() => '');

    root
      .append('g')
      .call(yGridAxis)
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickFormat((value) => d3.format('.1f')(Number(value))),
      )
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    const yAxis =
      scaleMode === 'linear'
        ? d3
            .axisLeft(yScaleLinear)
            .ticks(6)
            .tickFormat((value) => d3.format('~s')(Number(value)))
        : d3
            .axisLeft(yScaleLog)
            .tickValues(
              [0.01, 0.1, 1, 10, 100, 1000, 10000].filter((value) => value <= logDomainMax),
            )
            .tickFormat((value) => d3.format('~g')(Number(value)));

    root
      .append('g')
      .call(yAxis)
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    root
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Input Signal (0-1)');

    root
      .append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -48)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Luminance (cd/m²)');

    const drawCurve = (data: CurvePoint[], stroke: string, strokeDasharray?: string) => {
      root
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', stroke)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', strokeDasharray ?? null)
        .attr(
          'd',
          d3
            .line<CurvePoint>()
            .x((point) => xScale(point.input))
            .y((point) => yPosition(point.luminance))
            .curve(d3.curveMonotoneX),
        );
    };

    drawCurve(curves.pq, '#3b82f6');
    drawCurve(curves.hlg, '#22c55e');
    drawCurve(curves.gamma, '#9ca3af', '6 4');

    const legend = root
      .append('g')
      .attr('transform', `translate(${Math.max(innerWidth - 150, 0)}, 8)`);
    const legendItems = [
      { label: 'PQ (ST 2084)', color: '#3b82f6', dashed: false },
      { label: 'HLG (BT.2100)', color: '#22c55e', dashed: false },
      { label: 'SDR Gamma 2.4', color: '#9ca3af', dashed: true },
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
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dashed ? '6 4' : null);

      legend
        .append('text')
        .attr('x', 22)
        .attr('y', y + 4)
        .attr('fill', colors.legendText)
        .attr('font-size', 11)
        .text(item.label);
    });

    const hoverLine = root
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', colors.axis)
      .attr('stroke-dasharray', '4 4')
      .style('opacity', 0);

    const pqDot = root.append('circle').attr('r', 3.5).attr('fill', '#3b82f6').style('opacity', 0);
    const hlgDot = root.append('circle').attr('r', 3.5).attr('fill', '#22c55e').style('opacity', 0);
    const gammaDot = root
      .append('circle')
      .attr('r', 3.5)
      .attr('fill', '#9ca3af')
      .style('opacity', 0);

    root
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseleave', () => {
        hoverLine.style('opacity', 0);
        pqDot.style('opacity', 0);
        hlgDot.style('opacity', 0);
        gammaDot.style('opacity', 0);
        setTooltip(null);
      })
      .on('mousemove', (event) => {
        const [x] = d3.pointer(event);
        const input = Math.max(0, Math.min(1, xScale.invert(x)));
        const pq = pqEOTF(input);
        const hlg = hlgEOTF(input, hlgPeak);
        const gamma = gammaEOTF(input, 2.4) * SDR_REFERENCE_NITS;

        const chartX = xScale(input);
        hoverLine.attr('x1', chartX).attr('x2', chartX).style('opacity', 1);

        pqDot.attr('cx', chartX).attr('cy', yPosition(pq)).style('opacity', 1);
        hlgDot.attr('cx', chartX).attr('cy', yPosition(hlg)).style('opacity', 1);
        gammaDot.attr('cx', chartX).attr('cy', yPosition(gamma)).style('opacity', 1);

        const pointer = d3.pointer(event, containerRef.current);
        setTooltip({
          x: Math.min(pointer[0] + 12, containerWidth - 170),
          y: Math.max(pointer[1] - 8, 12),
          input,
          pq,
          hlg,
          gamma,
        });
      });
  }, [
    colors,
    containerWidth,
    curves.gamma,
    curves.hlg,
    curves.maxLuminance,
    curves.pq,
    hlgPeak,
    scaleMode,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">HLG Peak Lw: {hlgPeak} nits</span>
          <input
            type="range"
            min={400}
            max={4000}
            step={50}
            value={hlgPeak}
            onChange={(event) => setHlgPeak(Number(event.currentTarget.value))}
            className="w-full accent-blue-500"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Y-axis Scale</span>
          <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setScaleMode('linear')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                scaleMode === 'linear'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setScaleMode('log10')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                scaleMode === 'log10'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Log10
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900"
      >
        <svg ref={svgRef} className="h-auto w-full" />

        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900/95"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="font-semibold text-gray-900 dark:text-white">
              Input: {tooltip.input.toFixed(3)}
            </div>
            <div className="mt-1 text-[#3b82f6]">PQ: {tooltip.pq.toFixed(1)} cd/m²</div>
            <div className="text-[#22c55e]">HLG: {tooltip.hlg.toFixed(1)} cd/m²</div>
            <div className="text-[#9ca3af]">Gamma 2.4: {tooltip.gamma.toFixed(2)} cd/m²</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
