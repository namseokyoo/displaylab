/**
 * Polar Plot Component
 *
 * D3.js polar coordinate plot showing angular luminance distribution.
 * Supports comparison mode (two datasets overlayed).
 * Responsive SVG with dark theme.
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ViewingAngleData } from '@/types';

interface PolarPlotProps {
  data: ViewingAngleData[];
  comparisonData?: ViewingAngleData[];
  dataLabel?: string;
  comparisonLabel?: string;
  width?: number;
  height?: number;
}

export default function PolarPlot({
  data,
  comparisonData,
  dataLabel = 'Primary',
  comparisonLabel = 'Comparison',
  width = 450,
  height = 450,
}: PolarPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 50;
    const innerSize = Math.min(width, height) - margin * 2;
    const radius = innerSize / 2;
    const cx = width / 2;
    const cy = height / 2;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${cx},${cy})`);

    // Find max luminance for radial scale
    const allData = comparisonData ? [...data, ...comparisonData] : data;
    const maxLuminance = d3.max(allData, (d) => d.luminance) ?? 1;

    // Radial scale: luminance → radius
    const rScale = d3
      .scaleLinear()
      .domain([0, maxLuminance * 1.1])
      .range([0, radius]);

    // Angular scale: angle (degrees) → radians
    // We mirror the plot: show both positive and negative angles
    const angleToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

    // --- Grid rings ---
    const ringValues = [0.25, 0.5, 0.75, 1.0].map((f) => f * maxLuminance);
    g.selectAll('.ring')
      .data(ringValues)
      .enter()
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (d) => rScale(d))
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');

    // Ring labels
    g.selectAll('.ring-label')
      .data(ringValues)
      .enter()
      .append('text')
      .attr('x', 4)
      .attr('y', (d) => -rScale(d) - 2)
      .attr('fill', '#6b7280')
      .attr('font-size', '9px')
      .text((d) => `${Math.round(d)}`);

    // --- Angle spokes ---
    const spokeAngles = [0, 10, 20, 30, 40, 50, 60, 70, 80];
    spokeAngles.forEach((deg) => {
      const rad = angleToRad(deg);
      const x2 = radius * Math.cos(rad);
      const y2 = radius * Math.sin(rad);

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 0.5);

      // Mirror
      if (deg > 0) {
        const radMirror = angleToRad(-deg);
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', radius * Math.cos(radMirror))
          .attr('y2', radius * Math.sin(radMirror))
          .attr('stroke', '#1f2937')
          .attr('stroke-width', 0.5);
      }

      // Angle label (right side)
      const labelR = radius + 12;
      g.append('text')
        .attr('x', labelR * Math.cos(rad))
        .attr('y', labelR * Math.sin(rad))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '9px')
        .text(`${deg}\u00B0`);

      // Mirror label (left side)
      if (deg > 0) {
        const radMirror = angleToRad(-deg);
        g.append('text')
          .attr('x', labelR * Math.cos(radMirror))
          .attr('y', labelR * Math.sin(radMirror))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '9px')
          .text(`${deg}\u00B0`);
      }
    });

    // --- Plot data curve ---
    const plotCurve = (
      dataset: ViewingAngleData[],
      color: string,
      fillOpacity: number,
    ) => {
      // Build symmetric points: positive and negative angles
      const points: [number, number][] = [];
      const sorted = [...dataset].sort((a, b) => a.angle - b.angle);

      // Right side (positive angles)
      sorted.forEach((d) => {
        const rad = angleToRad(d.angle);
        const r = rScale(d.luminance);
        points.push([r * Math.cos(rad), r * Math.sin(rad)]);
      });

      // Left side (negative angles, mirror)
      [...sorted].reverse().forEach((d) => {
        if (d.angle === 0) return; // skip center duplicate
        const rad = angleToRad(-d.angle);
        const r = rScale(d.luminance);
        points.push([r * Math.cos(rad), r * Math.sin(rad)]);
      });

      // Close the path
      if (points.length > 0) {
        points.push(points[0]);
      }

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveCardinal.tension(0.6));

      // Filled area
      g.append('path')
        .datum(points)
        .attr('d', lineGen)
        .attr('fill', color)
        .attr('fill-opacity', fillOpacity)
        .attr('stroke', color)
        .attr('stroke-width', 1.5);

      // Data points
      sorted.forEach((d) => {
        const rad = angleToRad(d.angle);
        const r = rScale(d.luminance);
        g.append('circle')
          .attr('cx', r * Math.cos(rad))
          .attr('cy', r * Math.sin(rad))
          .attr('r', 3)
          .attr('fill', color)
          .attr('stroke', '#111827')
          .attr('stroke-width', 1);

        // Mirror point
        if (d.angle > 0) {
          const radM = angleToRad(-d.angle);
          g.append('circle')
            .attr('cx', r * Math.cos(radM))
            .attr('cy', r * Math.sin(radM))
            .attr('r', 3)
            .attr('fill', color)
            .attr('stroke', '#111827')
            .attr('stroke-width', 1);
        }
      });
    };

    // Draw comparison data first (behind)
    if (comparisonData && comparisonData.length > 0) {
      plotCurve(comparisonData, '#f59e0b', 0.08);
    }

    // Draw primary data
    plotCurve(data, '#3b82f6', 0.12);

    // --- Title ---
    svg
      .append('text')
      .attr('x', cx)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d1d5db')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text('Angular Luminance Distribution (cd/m\u00B2)');

    // --- Legend ---
    if (comparisonData && comparisonData.length > 0) {
      const legendY = height - 14;
      const legendG = svg.append('g').attr('transform', `translate(${cx - 80}, ${legendY})`);

      legendG
        .append('rect')
        .attr('x', 0)
        .attr('y', -6)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', '#3b82f6')
        .attr('rx', 2);
      legendG
        .append('text')
        .attr('x', 14)
        .attr('y', 4)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .text(dataLabel);

      legendG
        .append('rect')
        .attr('x', 90)
        .attr('y', -6)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', '#f59e0b')
        .attr('rx', 2);
      legendG
        .append('text')
        .attr('x', 104)
        .attr('y', 4)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .text(comparisonLabel);
    }
  }, [data, comparisonData, dataLabel, comparisonLabel, width, height]);

  return (
    <div className="inline-block">
      <svg ref={svgRef} className="bg-gray-900 rounded-lg" />
    </div>
  );
}
