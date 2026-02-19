/**
 * CIE Chromaticity Diagram Component
 *
 * Simplified from ISCV CIEDiagram (~2000 lines) to core rendering only (~400 lines):
 * - CIE 1931 xy / CIE 1976 u'v' spectral locus
 * - Color gamut triangles (standard + custom primaries)
 * - Point markers
 * - D65 white point
 *
 * Removed: spectrum ridge, drag, zoom/pan, axis range modal, snapshots
 */

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { SPECTRAL_LOCUS_XY, COLOR_GAMUTS } from '@/data/cie1931';
import { xyToUV } from '@/lib/cie';
import type { DiagramMode, GamutType, DiagramMarker, CustomPrimaries, CIE1931Coordinates } from '@/types';

/** Wavelength to approximate RGB color */
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
    intensity = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 780) {
    intensity = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
  }

  r = Math.round(255 * Math.pow(r * intensity, 0.8));
  g = Math.round(255 * Math.pow(g * intensity, 0.8));
  b = Math.round(255 * Math.pow(b * intensity, 0.8));

  return `rgb(${r},${g},${b})`;
}

/** Convert xy to mode-specific coordinates */
function convertToMode(
  xy: CIE1931Coordinates,
  mode: DiagramMode,
): { x: number; y: number } {
  if (mode === 'CIE1976') {
    const uv = xyToUV(xy);
    return { x: uv.u, y: uv.v };
  }
  return xy;
}

/** Gamut colors */
const GAMUT_COLORS: Record<string, string> = {
  sRGB: '#ffffff',
  'DCI-P3': '#22c55e',
  'BT.2020': '#f59e0b',
  AdobeRGB: '#a855f7',
  NTSC: '#ef4444',
};

interface CIEDiagramProps {
  mode: DiagramMode;
  enabledGamuts?: GamutType[];
  customPrimaries?: CustomPrimaries[];
  markers?: DiagramMarker[];
  width?: number;
  height?: number;
}

export default function CIEDiagram({
  mode,
  enabledGamuts = [],
  customPrimaries = [],
  markers = [],
  width = 500,
  height = 500,
}: CIEDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute locus points for current mode
  const locusPoints = useMemo(() => {
    return SPECTRAL_LOCUS_XY.map((p) => ({
      ...p,
      ...convertToMode({ x: p.x, y: p.y }, mode),
    }));
  }, [mode]);

  // Axis ranges
  const axisConfig = useMemo(() => {
    if (mode === 'CIE1931') {
      return { xRange: [0, 0.8] as [number, number], yRange: [0, 0.9] as [number, number], xLabel: 'x', yLabel: 'y' };
    }
    return { xRange: [0, 0.65] as [number, number], yRange: [0, 0.65] as [number, number], xLabel: "u'", yLabel: "v'" };
  }, [mode]);

  useEffect(() => {
    if (!svgRef.current) return;

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

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(axisConfig.xRange)
      .range([0, innerWidth]);
    const yScale = d3
      .scaleLinear()
      .domain(axisConfig.yRange)
      .range([innerHeight, 0]);

    // Grid
    const xTicks = d3.range(axisConfig.xRange[0], axisConfig.xRange[1] + 0.1, 0.1);
    const yTicks = d3.range(axisConfig.yRange[0], axisConfig.yRange[1] + 0.1, 0.1);

    g.selectAll('.grid-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 0.5);

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
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-4))
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-4))
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px');

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(axisConfig.xLabel);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(axisConfig.yLabel);

    // Spectral locus (filled with gradient-like segments)
    const locusLineGen = d3
      .line<{ x: number; y: number; wavelength: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Draw filled locus background
    const closedLocus = [...locusPoints, locusPoints[0]];
    g.append('path')
      .datum(closedLocus)
      .attr('d', locusLineGen)
      .attr('fill', 'rgba(50, 50, 50, 0.3)')
      .attr('stroke', 'none');

    // Draw locus outline with wavelength colors
    for (let i = 0; i < locusPoints.length - 1; i++) {
      const p1 = locusPoints[i];
      const p2 = locusPoints[i + 1];
      g.append('line')
        .attr('x1', xScale(p1.x))
        .attr('y1', yScale(p1.y))
        .attr('x2', xScale(p2.x))
        .attr('y2', yScale(p2.y))
        .attr('stroke', wavelengthToRGB(p1.wavelength))
        .attr('stroke-width', 2);
    }

    // Close locus (purple line from 780nm to 380nm)
    const first = locusPoints[0];
    const last = locusPoints[locusPoints.length - 1];
    g.append('line')
      .attr('x1', xScale(last.x))
      .attr('y1', yScale(last.y))
      .attr('x2', xScale(first.x))
      .attr('y2', yScale(first.y))
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,2');

    // Wavelength labels at key points
    const labelWavelengths = [460, 480, 500, 520, 540, 560, 580, 600, 620, 700];
    const labelPoints = locusPoints.filter((p) => labelWavelengths.includes(p.wavelength));
    g.selectAll('.wl-label')
      .data(labelPoints)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.x) + 6)
      .attr('y', (d) => yScale(d.y) - 4)
      .attr('fill', '#6b7280')
      .attr('font-size', '8px')
      .text((d) => `${d.wavelength}`);

    // Standard gamut triangles
    enabledGamuts.forEach((gamutKey) => {
      const gamut = COLOR_GAMUTS[gamutKey as keyof typeof COLOR_GAMUTS];
      if (!gamut) return;

      const vertices = gamut.vertices.map((v) => convertToMode(v, mode));
      const color = GAMUT_COLORS[gamutKey] || '#ffffff';

      const trianglePath = `M ${xScale(vertices[0].x)} ${yScale(vertices[0].y)} L ${xScale(vertices[1].x)} ${yScale(vertices[1].y)} L ${xScale(vertices[2].x)} ${yScale(vertices[2].y)} Z`;

      g.append('path')
        .attr('d', trianglePath)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.7);
    });

    // Custom primaries
    customPrimaries.forEach((cp) => {
      const vertices = [
        convertToMode(cp.primaries.red, mode),
        convertToMode(cp.primaries.green, mode),
        convertToMode(cp.primaries.blue, mode),
      ];

      const trianglePath = `M ${xScale(vertices[0].x)} ${yScale(vertices[0].y)} L ${xScale(vertices[1].x)} ${yScale(vertices[1].y)} L ${xScale(vertices[2].x)} ${yScale(vertices[2].y)} Z`;

      g.append('path')
        .attr('d', trianglePath)
        .attr('fill', cp.color)
        .attr('fill-opacity', 0.1)
        .attr('stroke', cp.color)
        .attr('stroke-width', 2);

      // Vertex dots
      vertices.forEach((v) => {
        g.append('circle')
          .attr('cx', xScale(v.x))
          .attr('cy', yScale(v.y))
          .attr('r', 4)
          .attr('fill', cp.color);
      });
    });

    // D65 white point
    const d65 = convertToMode({ x: 0.3127, y: 0.3290 }, mode);
    g.append('circle')
      .attr('cx', xScale(d65.x))
      .attr('cy', yScale(d65.y))
      .attr('r', 3)
      .attr('fill', 'white')
      .attr('stroke', '#374151')
      .attr('stroke-width', 1);

    g.append('text')
      .attr('x', xScale(d65.x) + 6)
      .attr('y', yScale(d65.y) + 4)
      .attr('fill', '#9ca3af')
      .attr('font-size', '9px')
      .text('D65');

    // Markers
    markers.forEach((m) => {
      const point = convertToMode({ x: m.x, y: m.y }, mode);
      g.append('circle')
        .attr('cx', xScale(point.x))
        .attr('cy', yScale(point.y))
        .attr('r', 4)
        .attr('fill', m.color)
        .attr('stroke', '#111827')
        .attr('stroke-width', 1);

      if (m.label) {
        g.append('text')
          .attr('x', xScale(point.x) + 6)
          .attr('y', yScale(point.y) - 6)
          .attr('fill', m.color)
          .attr('font-size', '9px')
          .text(m.label);
      }
    });

    // Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d1d5db')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text(mode === 'CIE1931' ? 'CIE 1931 Chromaticity Diagram' : "CIE 1976 u'v' Chromaticity Diagram");
  }, [mode, enabledGamuts, customPrimaries, markers, width, height, locusPoints, axisConfig]);

  return (
    <div className="inline-block">
      <svg ref={svgRef} className="bg-gray-900 rounded-lg" />
    </div>
  );
}
