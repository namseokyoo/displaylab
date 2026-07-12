# Display Lab

Professional display analysis tools for engineers and researchers.

## Features

- **Color Gamut Analyzer** - Compare display color gamuts against sRGB, DCI-P3, BT.2020, Adobe RGB, NTSC
- **Color Science Calculator** - XYZ/xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000)
- **Viewing Angle Analyzer** - CSV data upload, polar plots, color shift tracking, Delta E heatmaps
- **Spectrum Analyzer** - SPD presets, file/paste input, CIE chromaticity, CCT/Duv, and an experimental general CRI Ra estimate
- **HDR Analyzer** - PQ/HLG EOTF charts, tone mapping comparison, and HDR10 metadata quality checks
- **Panel Technology Comparator** - Side-by-side IPS, VA, OLED, Mini-LED, and QD-OLED comparison tables and radar charts

## Tech Stack

- React + Vite + TypeScript
- D3.js (data visualization)
- Tailwind CSS
- Vitest (testing)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run preview` | Preview production build |

## Privacy

Uploaded analysis files and pasted measurement data are processed in the browser. The app may still load configured analytics or advertising scripts, so this statement does not cover telemetry from those third-party services.

## License

MIT - SidequestLab
