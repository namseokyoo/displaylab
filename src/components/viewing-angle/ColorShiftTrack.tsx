/**
 * Color Shift Track Component
 *
 * Shows the viewing angle color shift trajectory on a CIE 1931 xy diagram.
 * Leverages the existing CIEDiagram markers prop for point rendering,
 * but draws the trajectory path directly for gradient coloring.
 */

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { SPECTRAL_LOCUS_XY } from '@/data/cie1931';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartColors } from '@/lib/chart-theme';
import type { ViewingAngleData } from '@/types';

/** Wavelength to approximate RGB color (simplified, same as CIEDiagram) */
function wavelengthToRGB(wavelength: number): string {
  let r = 0,
    g = 0,
    b = 0;

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

  let intensity = 1;
  if (wavelength >= 380 && wavelength < 420) {
    intensity = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 780) {
    intensity = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700);
  }

  r = Math.round(255 * Math.pow(r * intensity, 0.8));
  g = Math.round(255 * Math.pow(g * intensity, 0.8));
  b = Math.round(255 * Math.pow(b * intensity, 0.8));

  return `rgb(${r},${g},${b})`;
}

interface ColorShiftTrackProps {
  data: ViewingAngleData[];
  comparisonData?: ViewingAngleData[];
  dataLabel?: string;
  comparisonLabel?: string;
  width?: number;
  height?: number;
}

export default function ColorShiftTrack({
  data,
  comparisonData,
  dataLabel = 'Primary',
  comparisonLabel = 'Comparison',
  width = 450,
  height = 450,
}: ColorShiftTrackProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark } = useTheme();
  const colors = useMemo(() => getChartColors(isDark), [isDark]);

  const locusPoints = useMemo(() => {
    return SPECTRAL_LOCUS_XY.map((p) => ({ x: p.x, y: p.y, wavelength: p.wavelength }));
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Use full CIE diagram range for context
    const fullXRange: [number, number] = [0, 0.8];
    const fullYRange: [number, number] = [0, 0.9];

    const xScale = d3.scaleLinear().domain(fullXRange).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(fullYRange).range([innerHeight, 0]);

    // Grid
    const xTicks = d3.range(0, 0.9, 0.1);
    const yTicks = d3.range(0, 1.0, 0.1);

    g.selectAll('.grid-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', colors.grid)
      .attr('stroke-width', 0.5);

    g.selectAll('.grid-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', colors.grid)
      .attr('stroke-width', 0.5);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-4))
      .attr('color', colors.axis)
      .selectAll('text')
      .attr('fill', colors.axisLabel)
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-4))
      .attr('color', colors.axis)
      .selectAll('text')
      .attr('fill', colors.axisLabel)
      .attr('font-size', '10px');

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', '12px')
      .text('x');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.axisLabel)
      .attr('font-size', '12px')
      .text('y');

    // --- Spectral locus ---
    const closedLocus = [...locusPoints, locusPoints[0]];
    const locusLine = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    g.append('path')
      .datum(closedLocus)
      .attr('d', locusLine)
      .attr('fill', colors.locusFill)
      .attr('stroke', 'none');

    for (let i = 0; i < locusPoints.length - 1; i++) {
      const p1 = locusPoints[i];
      const p2 = locusPoints[i + 1];
      g.append('line')
        .attr('x1', xScale(p1.x))
        .attr('y1', yScale(p1.y))
        .attr('x2', xScale(p2.x))
        .attr('y2', yScale(p2.y))
        .attr('stroke', wavelengthToRGB(p1.wavelength))
        .attr('stroke-width', 1.5);
    }

    // Close locus purple line
    const first = locusPoints[0];
    const last = locusPoints[locusPoints.length - 1];
    g.append('line')
      .attr('x1', xScale(last.x))
      .attr('y1', yScale(last.y))
      .attr('x2', xScale(first.x))
      .attr('y2', yScale(first.y))
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2');

    // --- D65 white point ---
    g.append('circle')
      .attr('cx', xScale(0.3127))
      .attr('cy', yScale(0.329))
      .attr('r', 3)
      .attr('fill', colors.d65Fill)
      .attr('stroke', colors.d65Stroke)
      .attr('stroke-width', 1);

    g.append('text')
      .attr('x', xScale(0.3127) + 6)
      .attr('y', yScale(0.329) + 4)
      .attr('fill', colors.annotation)
      .attr('font-size', '9px')
      .text('D65');

    // --- Draw trajectory ---
    const drawTrajectory = (
      dataset: ViewingAngleData[],
      baseColor: string,
    ) => {
      const sorted = [...dataset].sort((a, b) => a.angle - b.angle);
      const maxAngle = d3.max(sorted, (d) => d.angle) ?? 80;

      // Angle-based color scale (bright to dark)
      const colorScale = d3
        .scaleLinear<string>()
        .domain([0, maxAngle])
        .range([baseColor, d3.color(baseColor)!.darker(2).toString()]);

      // Draw segments with gradient
      for (let i = 0; i < sorted.length - 1; i++) {
        const p1 = sorted[i];
        const p2 = sorted[i + 1];
        g.append('line')
          .attr('x1', xScale(p1.cieX))
          .attr('y1', yScale(p1.cieY))
          .attr('x2', xScale(p2.cieX))
          .attr('y2', yScale(p2.cieY))
          .attr('stroke', colorScale(p1.angle))
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.8);
      }

      // Draw points
      sorted.forEach((d) => {
        const ptColor = colorScale(d.angle);
        g.append('circle')
          .attr('cx', xScale(d.cieX))
          .attr('cy', yScale(d.cieY))
          .attr('r', d.angle === 0 ? 5 : 3.5)
          .attr('fill', ptColor)
          .attr('stroke', colors.pointStroke)
          .attr('stroke-width', 1);

        // Label 0-degree and last angle
        if (d.angle === 0 || d === sorted[sorted.length - 1]) {
          g.append('text')
            .attr('x', xScale(d.cieX) + 6)
            .attr('y', yScale(d.cieY) - 6)
            .attr('fill', ptColor)
            .attr('font-size', '9px')
            .text(`${d.angle}\u00B0`);
        }
      });
    };

    // Comparison trajectory
    if (comparisonData && comparisonData.length > 0) {
      drawTrajectory(comparisonData, '#f59e0b');
    }

    // Primary trajectory
    drawTrajectory(data, '#3b82f6');

    // --- Title ---
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.title)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text('CIE 1931 Color Shift Trajectory');

    // --- Legend ---
    if (comparisonData && comparisonData.length > 0) {
      const legendG = g.append('g').attr('transform', `translate(${innerWidth - 160}, ${innerHeight - 40})`);

      legendG
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 155)
        .attr('height', 36)
        .attr('fill', colors.legendBg)
        .attr('fill-opacity', 0.8)
        .attr('rx', 4);

      legendG
        .append('circle')
        .attr('cx', 10)
        .attr('cy', 10)
        .attr('r', 4)
        .attr('fill', '#3b82f6');
      legendG
        .append('text')
        .attr('x', 18)
        .attr('y', 14)
        .attr('fill', colors.legendText)
        .attr('font-size', '10px')
        .text(dataLabel);

      legendG
        .append('circle')
        .attr('cx', 10)
        .attr('cy', 26)
        .attr('r', 4)
        .attr('fill', '#f59e0b');
      legendG
        .append('text')
        .attr('x', 18)
        .attr('y', 30)
        .attr('fill', colors.legendText)
        .attr('font-size', '10px')
        .text(comparisonLabel);
    }
  }, [data, comparisonData, dataLabel, comparisonLabel, width, height, locusPoints, colors]);

  return (
    <div className="inline-block">
      <svg ref={svgRef} className="bg-white dark:bg-gray-900 rounded-lg" />
    </div>
  );
}
