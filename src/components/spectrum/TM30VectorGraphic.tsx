/**
 * TM-30 Color Vector Graphic Component
 *
 * Renders the 16-bin polar coordinate color vector graphic
 * showing reference vs test light source gamut in a*b* space.
 *
 * Uses D3.js for SVG rendering.
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TM30Result } from '@/lib/cri';
import { useTheme } from '@/contexts/ThemeContext';

interface TM30VectorGraphicProps {
  result: TM30Result | null;
  width?: number;
  height?: number;
}

/** Hue bin color labels for the 16 bins */
const BIN_COLORS = [
  '#e74c3c', '#e67e22', '#f39c12', '#f1c40f',
  '#d4ac0d', '#2ecc71', '#27ae60', '#1abc9c',
  '#16a085', '#3498db', '#2980b9', '#8e44ad',
  '#9b59b6', '#c0392b', '#e84393', '#fd79a8',
];

const BIN_LABELS = [
  'Red', 'Red-Org', 'Orange', 'Ylw-Org',
  'Yellow', 'Ylw-Grn', 'Green', 'Grn-Cyn',
  'Cyan', 'Blu-Cyn', 'Blue', 'Blu-Vio',
  'Violet', 'Purple', 'Pink', 'Pnk-Red',
];

export default function TM30VectorGraphic({
  result,
  width = 400,
  height = 400,
}: TM30VectorGraphicProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 40;
    const w = width;
    const h = height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - margin;

    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? '#4b5563' : '#d1d5db';
    const bgColor = isDark ? '#111827' : '#ffffff';

    // Background
    svg.attr('width', w).attr('height', h);
    svg.append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', bgColor)
      .attr('rx', 8);

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    if (!result) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', textColor)
        .attr('font-size', 14)
        .text('Load spectrum data to view TM-30 color vectors');
      return;
    }

    // Determine scale based on data
    const maxChroma = Math.max(
      ...result.colorVectors.map((v) => Math.sqrt(v.refA ** 2 + v.refB ** 2)),
      ...result.colorVectors.map((v) => Math.sqrt(v.testA ** 2 + v.testB ** 2)),
      1,
    );
    const scale = radius / (maxChroma * 1.3);

    // Draw concentric circles (grid)
    const gridSteps = [0.25, 0.5, 0.75, 1.0];
    for (const step of gridSteps) {
      const r = maxChroma * step * scale;
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', gridColor)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', step === 1.0 ? 'none' : '3,3');
    }

    // Draw axes
    g.append('line')
      .attr('x1', -radius)
      .attr('y1', 0)
      .attr('x2', radius)
      .attr('y2', 0)
      .attr('stroke', gridColor)
      .attr('stroke-width', 0.5);

    g.append('line')
      .attr('x1', 0)
      .attr('y1', -radius)
      .attr('x2', 0)
      .attr('y2', radius)
      .attr('stroke', gridColor)
      .attr('stroke-width', 0.5);

    // Axis labels
    g.append('text').attr('x', radius + 5).attr('y', 4).attr('font-size', 10).attr('fill', textColor).text('+a*');
    g.append('text').attr('x', -radius - 15).attr('y', 4).attr('font-size', 10).attr('fill', textColor).text('-a*');
    g.append('text').attr('x', -4).attr('y', -radius - 5).attr('font-size', 10).attr('fill', textColor).text('+b*');
    g.append('text').attr('x', -4).attr('y', radius + 15).attr('font-size', 10).attr('fill', textColor).text('-b*');

    // Draw reference gamut polygon (dashed)
    const refPoints = result.colorVectors.map((v) => [v.refA * scale, -v.refB * scale] as [number, number]);
    const lineGenerator = d3.line<[number, number]>().x((d) => d[0]).y((d) => d[1]);

    g.append('path')
      .datum([...refPoints, refPoints[0]])
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', isDark ? '#6b7280' : '#9ca3af')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,3');

    // Draw test gamut polygon (solid)
    const testPoints = result.colorVectors.map((v) => [v.testA * scale, -v.testB * scale] as [number, number]);

    g.append('path')
      .datum([...testPoints, testPoints[0]])
      .attr('d', lineGenerator)
      .attr('fill', isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Draw color vector arrows (reference -> test)
    for (let i = 0; i < result.colorVectors.length; i++) {
      const v = result.colorVectors[i];
      const rx = v.refA * scale;
      const ry = -v.refB * scale;
      const tx = v.testA * scale;
      const ty = -v.testB * scale;

      // Arrow line
      g.append('line')
        .attr('x1', rx)
        .attr('y1', ry)
        .attr('x2', tx)
        .attr('y2', ty)
        .attr('stroke', BIN_COLORS[i])
        .attr('stroke-width', 1.5)
        .attr('marker-end', `url(#arrow-${i})`);

      // Reference point (hollow circle)
      g.append('circle')
        .attr('cx', rx)
        .attr('cy', ry)
        .attr('r', 3)
        .attr('fill', 'none')
        .attr('stroke', BIN_COLORS[i])
        .attr('stroke-width', 1.5);

      // Test point (filled circle)
      g.append('circle')
        .attr('cx', tx)
        .attr('cy', ty)
        .attr('r', 3.5)
        .attr('fill', BIN_COLORS[i])
        .attr('stroke', 'none');
    }

    // Add arrowhead markers
    const defs = svg.append('defs');
    for (let i = 0; i < 16; i++) {
      defs.append('marker')
        .attr('id', `arrow-${i}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 8)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', BIN_COLORS[i]);
    }

    // Bin labels around the outside
    for (let i = 0; i < 16; i++) {
      const angle = (i * 22.5 + 11.25 - 90) * (Math.PI / 180);
      const labelR = radius + 20;
      const lx = Math.cos(angle) * labelR;
      const ly = Math.sin(angle) * labelR;

      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 7)
        .attr('fill', BIN_COLORS[i])
        .attr('font-weight', 500)
        .text(BIN_LABELS[i]);
    }
  }, [result, width, height, isDark]);

  return (
    <div>
      <svg ref={svgRef} className="mx-auto" />
      {result && (
        <div className="mt-2 flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-gray-400" />
            <span>Reference</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-blue-500" />
            <span>Test Source</span>
          </div>
        </div>
      )}
    </div>
  );
}
