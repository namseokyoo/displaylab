import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SpectrumPoint } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartColors } from '@/lib/chart-theme';

interface SpectrumChartProps {
  data: SpectrumPoint[];
  peakWavelength?: number;
  width?: number;
  height?: number;
}

function wavelengthToRGB(wavelength: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
  }

  let factor = 1;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * ((wavelength - 380) / (420 - 380));
  } else if (wavelength >= 700 && wavelength <= 780) {
    factor = 0.3 + 0.7 * ((780 - wavelength) / (780 - 700));
  }

  const rr = Math.round(255 * Math.pow(r * factor, 0.8));
  const gg = Math.round(255 * Math.pow(g * factor, 0.8));
  const bb = Math.round(255 * Math.pow(b * factor, 0.8));
  return `rgb(${rr}, ${gg}, ${bb})`;
}

function getPeakPoint(data: SpectrumPoint[], preferredPeak?: number): SpectrumPoint | null {
  if (data.length === 0) return null;

  if (typeof preferredPeak === 'number' && Number.isFinite(preferredPeak)) {
    return data.reduce((closest, point) =>
      Math.abs(point.wavelength - preferredPeak) < Math.abs(closest.wavelength - preferredPeak) ? point : closest
    );
  }

  return data.reduce((peak, point) => (point.intensity > peak.intensity ? point : peak));
}

export default function SpectrumChart({ data, peakWavelength, width, height = 320 }: SpectrumChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const reactId = useId();
  const gradientId = `spectrum-gradient-${reactId.replace(/:/g, '')}`;
  const { isDark } = useTheme();
  const colors = useMemo(() => getChartColors(isDark), [isDark]);

  useEffect(() => {
    if (typeof width === 'number' && width > 0) return;
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
  }, [width]);

  useEffect(() => {
    if (!svgRef.current) return;

    const resolvedWidth = width ?? containerWidth;
    if (!resolvedWidth || resolvedWidth <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 24, right: 20, bottom: 44, left: 52 };
    const innerWidth = resolvedWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    if (innerWidth <= 0 || innerHeight <= 0) return;

    const root = svg
      .attr('width', resolvedWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${resolvedWidth} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const plotData = [...data]
      .filter((point) =>
        Number.isFinite(point.wavelength) &&
        Number.isFinite(point.intensity) &&
        point.wavelength >= 380 &&
        point.wavelength <= 780
      )
      .sort((a, b) => a.wavelength - b.wavelength)
      .map((point) => ({ wavelength: point.wavelength, intensity: Math.max(0, Math.min(1, point.intensity)) }));

    const xScale = d3.scaleLinear().domain([380, 780]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    const xGrid = d3.axisBottom(xScale).ticks(8).tickSize(-innerHeight).tickFormat(() => '');
    const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => '');

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xGrid)
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    root
      .append('g')
      .call(yGrid)
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.grid))
      .call((g) => g.select('.domain').remove());

    const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat((value) => `${value}`);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    root
      .append('g')
      .call(yAxis)
      .call((g) => g.selectAll('text').attr('fill', colors.axisLabel).attr('font-size', 11))
      .call((g) => g.selectAll('line').attr('stroke', colors.axis))
      .call((g) => g.select('.domain').attr('stroke', colors.axis));

    root
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Wavelength (nm)');

    root
      .append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -38)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', 12)
      .text('Intensity (0-1)');

    if (plotData.length === 0) {
      root
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.annotation)
        .attr('font-size', 13)
        .text('No spectrum data');
      return;
    }

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    for (let wavelength = 380; wavelength <= 780; wavelength += 5) {
      const stop = ((wavelength - 380) / (780 - 380)) * 100;
      gradient
        .append('stop')
        .attr('offset', `${stop}%`)
        .attr('stop-color', wavelengthToRGB(wavelength));
    }

    const area = d3
      .area<SpectrumPoint>()
      .x((point) => xScale(point.wavelength))
      .y0(yScale(0))
      .y1((point) => yScale(point.intensity))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line<SpectrumPoint>()
      .x((point) => xScale(point.wavelength))
      .y((point) => yScale(point.intensity))
      .curve(d3.curveMonotoneX);

    root
      .append('path')
      .datum(plotData)
      .attr('fill', `url(#${gradientId})`)
      .attr('fill-opacity', 0.6)
      .attr('d', area);

    root
      .append('path')
      .datum(plotData)
      .attr('fill', 'none')
      .attr('stroke', colors.title)
      .attr('stroke-width', 1.75)
      .attr('d', line);

    const peakPoint = getPeakPoint(plotData, peakWavelength);
    if (peakPoint) {
      const px = xScale(peakPoint.wavelength);
      const py = yScale(peakPoint.intensity);

      root
        .append('line')
        .attr('x1', px)
        .attr('x2', px)
        .attr('y1', innerHeight)
        .attr('y2', 0)
        .attr('stroke', colors.annotation)
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4 4');

      root
        .append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 4)
        .attr('fill', wavelengthToRGB(peakPoint.wavelength))
        .attr('stroke', colors.pointStroke)
        .attr('stroke-width', 1.3);

      root
        .append('text')
        .attr('x', Math.min(px + 8, innerWidth - 4))
        .attr('y', Math.max(py - 10, 12))
        .attr('fill', colors.annotation)
        .attr('font-size', 11)
        .attr('font-weight', 600)
        .text(`Peak ${peakPoint.wavelength.toFixed(1)}nm`);
    }
  }, [colors, containerWidth, data, gradientId, height, peakWavelength, width]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <svg ref={svgRef} className="h-auto w-full" />
    </div>
  );
}
