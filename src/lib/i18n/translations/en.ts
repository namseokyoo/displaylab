/**
 * English Translations (Default)
 *
 * All user-facing text in Display Lab.
 * Namespace convention: common.*, home.*, gamut.*, color.*, viewing.*, spectrum.*, hdr.*, panel.*, cri.*
 */

const en = {
  // ============================================================
  // Common (shared across pages)
  // ============================================================
  common: {
    share: 'Share',
    linkCopied: 'Link copied!',
    copyShareLink: 'Copy share link',
    loading: 'Loading...',
    resetSettings: 'Reset saved settings',
    resetConfirm: 'Reset all saved settings except theme?',
    resetDone: 'Settings reset. Reloading...',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    dataStaysLocal: 'Your data stays in your browser',
    sponsoredContent: 'Sponsored content',
    downloadPng: 'Download as PNG',
    exportCsv: 'Export CSV',
    presets: 'Presets',
    coordinate: 'Coordinate',
    standards: 'Standards',
    template: 'Template',
    comparison: 'Comparison',
    result: 'Result',
    invalid: 'Invalid input',
    language: 'Language',
  },

  // ============================================================
  // Navigation
  // ============================================================
  nav: {
    gamutAnalyzer: 'Gamut Analyzer',
    colorCalculator: 'Color Calculator',
    viewingAngle: 'Viewing Angle',
    spectrumAnalyzer: 'Spectrum Analyzer',
    panelCompare: 'Panel Compare',
    hdrAnalyzer: 'HDR Analyzer',
  },

  // ============================================================
  // Home Page
  // ============================================================
  home: {
    heroTitle1: 'Professional',
    heroTitle2: 'Display',
    heroTitle3: 'Analysis Tools',
    heroSubtitle: 'Free web-based tools for display engineers and researchers. Analyze viewing angles, compare color gamuts, and perform color science calculations \u2014 all in your browser.',
    ctaGamut: 'Try Gamut Analyzer',
    ctaColor: 'Open Color Calculator',
    badgePrivacy: 'Your data never leaves your browser',
    badgeStandard: 'Validated against CIE standards',
    badgeFree: 'Free \u2014 no account required',
    toolsHeading: 'Analysis Tools',
    statProcessing: 'Client-side Processing',
    statProcessingSub: 'No data sent to servers',
    statValidated: 'Standard Validated',
    statValidatedSub: 'Sharma 2005, CIE 15:2004',
    statFree: 'No Account Required',
    statFreeSub: 'Open for everyone',
    builtBy: 'Built by',
    // Tool cards
    toolGamutTitle: 'Color Gamut Analyzer',
    toolGamutDesc: 'Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards. Calculate coverage percentage with CIE 1931 and 1976 diagrams.',
    toolGamutCta: 'Analyze Gamut',
    toolColorTitle: 'Color Science Calculator',
    toolColorDesc: 'Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000).',
    toolColorCta: 'Open Calculator',
    toolViewingTitle: 'Viewing Angle Analyzer',
    toolViewingDesc: 'Upload goniometer CSV data to visualize display viewing angle performance: polar plots, color shift tracking, and Delta E heatmaps.',
    toolViewingCta: 'Analyze Viewing Angle',
    toolSpectrumTitle: 'Spectrum Analyzer',
    toolSpectrumDesc: 'Analyze emission spectra (SPD): calculate CIE chromaticity, CCT, Duv, FWHM, and visualize on CIE diagram.',
    toolSpectrumCta: 'Analyze Spectrum',
    toolPanelTitle: 'Panel Technology Comparator',
    toolPanelDesc: 'Compare display panel technologies side by side: IPS, VA, OLED, Mini-LED, QD-OLED. Interactive radar charts and detailed specifications.',
    toolPanelCta: 'Compare Panels',
    toolHdrTitle: 'HDR Analyzer',
    toolHdrDesc: 'Visualize PQ/HLG EOTF curves, compare tone mapping algorithms, and analyze HDR10 metadata including peak brightness and dynamic range.',
    toolHdrCta: 'Analyze HDR',
  },

  // ============================================================
  // Gamut Analyzer
  // ============================================================
  gamut: {
    title: 'Color Gamut Analyzer',
    subtitle: 'Compare display color gamuts against industry standards. Input your display primaries or select from device presets.',
    displayGamuts: 'Display Gamuts',
    aboutCoverage: 'About Coverage Calculation',
    aboutCoverageText: 'Coverage is calculated as the area ratio of the display gamut triangle to each standard gamut triangle using the Shoelace formula. This method gives the overall area percentage, not the intersection-based coverage. Intersection-based calculation will be available in a future update.',
    addDisplay: '+ Add',
    removeDisplay: 'Remove display',
    comparisonSummary: 'Comparison Summary',
    display: 'Display',
    displayName: 'Display name',
    standardGamut: 'Standard gamut...',
    devicePreset: 'Device preset...',
    gamutArea: 'Gamut Area:',
    standard: 'Standard',
    areaRatioNote: '* Area ratio method. Intersection-based coverage in Phase 2.',
    // SEO
    seoTitle: 'Color Gamut Analyzer - Display Lab',
    seoDesc: 'Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards. Calculate coverage percentage with CIE 1931 and 1976 diagrams.',
  },

  // ============================================================
  // Color Calculator
  // ============================================================
  color: {
    title: 'Color Science Calculator',
    subtitle: 'Quick CIE color calculations: coordinate conversion, CCT & Duv, Delta E, and universal color space converter.',
    // Coordinate Converter
    coordTitle: 'Coordinate Converter',
    coordSubtitle: 'Bidirectional XYZ \u2194 xyY conversion',
    coordResultXyY: 'Result: xyY',
    coordResultXYZ: 'Result: XYZ',
    yLuminance: 'Y (Luminance)',
    // CCT Calculator
    cctTitle: 'CCT Calculator',
    cctSubtitle: 'Correlated Color Temperature + Duv from CIE xy',
    cctGreenish: '> 0: greenish tint',
    cctPinkish: '< 0: pinkish tint',
    cctValidation: 'Enter valid CIE xy coordinates (0-1 range)',
    // Delta E Calculator
    deltaETitle: 'Delta E Calculator',
    deltaESubtitle: 'CIE76, CIE94, CIEDE2000 color difference',
    color1: 'Color 1',
    color2: 'Color 2',
    interpretGuide: 'CIEDE2000 Interpretation Guide',
    presetNearIdentical: 'Near identical',
    presetSubtle: 'Subtle difference',
    presetNoticeable: 'Noticeable difference',
    presetLarge: 'Large difference',
    deImperceptible: 'Imperceptible',
    deBarelyPerceptible: 'Barely perceptible',
    deNoticeable: 'Noticeable on close inspection',
    deClearlyNoticeable: 'Clearly noticeable',
    deObvious: 'Obvious difference',
    deGuideImperceptible: '< 1.0 \u2014 Imperceptible',
    deGuideBarelyPerceptible: '1.0-2.0 \u2014 Barely perceptible',
    deGuideNoticeable: '2.0-3.5 \u2014 Noticeable',
    deGuideClearlyNoticeable: '3.5-5.0 \u2014 Clearly noticeable',
    deGuideObvious: '> 5.0 \u2014 Obvious difference',
    // Universal Converter
    uniTitle: 'Universal Converter',
    uniSubtitle: 'Convert between 10 color spaces via XYZ hub',
    sourceColorSpace: 'Source Color Space',
    previewSrgb: 'Preview (sRGB)',
    outOfGamut: 'Out of sRGB gamut (preview is clipped)',
    allColorSpaces: 'All Color Spaces',
    source: '(source)',
    // SEO
    seoTitle: 'Color Science Calculator - Display Lab',
    seoDesc: 'Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000), and universal color space converter (10 color spaces).',
  },

  // ============================================================
  // Viewing Angle Analyzer
  // ============================================================
  viewing: {
    title: 'Viewing Angle Analyzer',
    subtitle: 'Upload goniometer CSV data or select a preset to analyze display viewing angle performance. Visualize angular luminance, color shift trajectory, and Delta E distribution.',
    polarPlot: 'Polar Plot',
    colorShift: 'Color Shift Trajectory',
    deltaEDist: 'Delta E Distribution',
    downloadTemplate: 'Download CSV Template',
    compareMode: 'Compare Mode',
    exitComparison: 'Exit Comparison',
    comparePrompt: 'Upload a second CSV or select a preset to compare.',
    loadingPreset: 'Loading preset data...',
    measurementData: 'Measurement Data',
    emptyState: 'Upload a CSV file with viewing angle measurement data, or select a preset above to get started. The CSV should contain columns:',
    emptyPolar: 'Polar Plot',
    emptyPolarSub: 'Angular luminance',
    emptyColorShift: 'Color Shift',
    emptyColorShiftSub: 'CIE trajectory',
    emptyDeltaE: 'Delta E Map',
    emptyDeltaESub: 'Angle heatmap',
    angle: 'Angle',
    luminance: 'Luminance',
    // Table columns
    colAngle: 'Angle',
    colLuminance: 'Luminance',
    colCieX: 'CIE x',
    colCieY: 'CIE y',
    colDeltaEab: '\u0394E*ab',
    colDeltaE00: '\u0394E\u2080\u2080',
    colCR: 'CR',
    data: 'Data',
    // SEO
    seoTitle: 'Viewing Angle Analyzer - Display Lab',
    seoDesc: 'Upload goniometer CSV data to visualize display viewing angle performance: polar plots, color shift tracking, and Delta E heatmaps.',
  },

  // ============================================================
  // CSV Uploader
  // ============================================================
  csv: {
    dropText: 'Drop CSV file here or click to browse',
    supportedFormats: 'Supports CSV, TSV, TXT (max {maxRows} rows)',
    noValidData: 'No valid data found in file',
    exceedsMax: 'File exceeds maximum {maxRows} rows (Free tier limit)',
    parseFailed: 'Failed to parse file',
  },

  // ============================================================
  // Spectrum Analyzer
  // ============================================================
  spectrum: {
    title: 'Spectrum Analyzer',
    subtitle: 'Analyze emission spectra (SPD) to estimate chromaticity, CCT, Duv, and spectral width metrics.',
    spectrumChart: 'Spectrum Chart',
    spectrumChartDesc: 'Wavelength versus normalized intensity (380-780nm).',
    cieDiagram: 'CIE Diagram',
    // Spectrum Data Input
    dataInputTitle: 'Spectrum Data Input',
    dataInputDesc: 'Load spectrum data from file upload, clipboard paste, or built-in presets.',
    tabPresets: 'Presets',
    tabFile: 'File',
    tabPaste: 'Paste',
    builtInPresets: 'Built-in presets',
    generatedPresets: 'Generated Gaussian presets',
    fileDragDrop: 'Drag a file here or click to upload',
    fileFormats: 'Supported formats: CSV, TSV, TXT',
    processing: 'Processing spectrum data...',
    applyData: 'Apply Data',
    readClipboard: 'Read Clipboard',
    sampleData: 'Sample Data',
    pasteFirst: 'Paste spectrum data first.',
    noDataPoints: 'No valid spectrum data points were found.',
    processingFailed: 'Spectrum processing failed.',
    fileOnly: 'Only CSV, TSV, or TXT files are supported.',
    clipboardUnavailable: 'Clipboard access is unavailable. Please paste data manually.',
    warnCoverage: 'Input does not fully cover 380-780nm; edge regions may be filled with zeros after interpolation.',
    warnLowCount: 'Data point count is low; analysis accuracy may be reduced.',
    // Spectrum Results
    resultsTitle: 'Spectrum Analysis Results',
    resultsDesc: 'Chromaticity and spectral metrics calculated from the loaded spectrum.',
    cct: 'CCT',
    duv: 'Duv',
    dominantWavelength: 'Dominant Wavelength',
    purity: 'Purity',
    peakWavelength: 'Peak Wavelength',
    fwhm: 'FWHM',
    estimatedColor: 'Estimated Color',
    // SEO
    seoTitle: 'Spectrum Analyzer - Display Lab',
    seoDesc: 'Analyze emission spectra (SPD): calculate CIE chromaticity, CCT, Duv, FWHM, and visualize on CIE diagram.',
  },

  // ============================================================
  // CRI / Light Quality
  // ============================================================
  cri: {
    lightQualityTitle: 'Light Quality Metrics',
    lightQualityDesc: 'Color rendering quality analysis based on the loaded spectrum.',
    criRa: 'CRI Ra',
    tm30Rf: 'TM-30 Rf',
    tm30Rg: 'TM-30 Rg',
    tlciQa: 'TLCI Qa',
    generalCri: 'General CRI',
    fidelityIndex: 'Fidelity Index',
    gamutIndex: 'Gamut Index',
    tvLighting: 'TV Lighting',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    interpretExcellent: 'Excellent color rendering. Suitable for all applications.',
    interpretGood: 'Good color rendering. Suitable for most applications.',
    interpretFair: 'Fair color rendering. Some color distortion may be noticeable.',
    interpretPoor: 'Poor color rendering. Significant color distortion expected.',
    // CRI Results
    criTitle: 'CRI (Color Rendering Index)',
    criEmpty: 'Load spectrum data to calculate CRI Ra and R1-R14 scores.',
    criReference: 'CIE 13.3-1995 \u2014 Reference:',
    criPlanckian: 'Planckian',
    criDSeries: 'CIE D-series',
    criAt: 'at',
    individualScores: 'Individual Scores (R1-R14)',
    r9Red: 'R9 (Red)',
    r13Skin: 'R13 (Skin)',
    r14Leaf: 'R14 (Leaf)',
    // TM-30
    tm30Title: 'IES TM-30-20 Color Vector Graphic',
    tm30Desc: '16-bin gamut comparison in CIELAB a*b* plane. Arrows show color shift from reference to test.',
    fidelity: 'Fidelity (Rf)',
    gamut: 'Gamut (Rg)',
    expandedGamut: 'Expanded gamut',
    reducedGamut: 'Reduced gamut',
    neutralGamut: 'Neutral gamut',
    // TLCI
    tlciTitle: 'TLCI (Television Lighting Consistency Index)',
    tlciDesc: 'Evaluates color rendering quality for broadcast camera capture.',
    tlciEmpty: 'Load spectrum data to calculate TLCI.',
    tlciScore: 'TLCI Score',
    broadcastReady: 'Broadcast Ready',
    acceptable: 'Acceptable',
    needsCorrection: 'Needs Correction',
    notRecommended: 'Not Recommended',
    interpretationGuide: 'Interpretation Guide',
    tlci85: 'Use with confidence',
    tlci75: 'Minor correction may help',
    tlci50: 'Post-production correction needed',
    tlci0: 'Not recommended for broadcast',
  },

  // ============================================================
  // HDR Analyzer
  // ============================================================
  hdr: {
    title: 'HDR Analyzer',
    subtitle: 'Visualize HDR transfer functions and evaluate HDR10 metadata quality for mastering and playback targets.',
    eotfTitle: 'EOTF Curves',
    eotfDesc: 'Compare PQ, HLG, and SDR gamma response against display luminance.',
    toneMappingTitle: 'Tone Mapping Curves',
    toneMappingDesc: 'Compare Reinhard, Hable, and ACES operators from HDR luminance to normalized output.',
    // Metadata Input
    metadataTitle: 'HDR10 Metadata Input',
    metadataDesc: 'Enter static metadata values or load a preset profile for instant HDR capability analysis.',
    luminanceMetadata: 'Luminance Metadata',
    primaries: 'Primaries (x, y)',
    whitePoint: 'White Point (x, y)',
    // Results
    resultsTitle: 'HDR Analysis Results',
    resultsEmpty: 'Enter HDR10 metadata values to see analysis results.',
    resultsDesc: 'Real-time capability metrics derived from HDR10 static metadata.',
    peakBrightnessScore: 'Peak Brightness Score:',
    hdr10Compatibility: 'HDR10 Compatibility:',
    dynamicRange: 'Dynamic Range',
    dynamicRangeHelper: 'Calculated from mastering max/min luminance',
    maxCLLvsMaxFALL: 'MaxCLL vs MaxFALL',
    bt2020Coverage: 'BT.2020 Gamut Coverage',
    hdr10Grade: 'HDR10 Grade',
    // SEO
    seoTitle: 'HDR Analyzer - Display Lab',
    seoDesc: 'Visualize PQ/HLG EOTF curves, compare tone mapping algorithms, and analyze HDR10 metadata including peak brightness and dynamic range.',
  },

  // ============================================================
  // Panel Comparison
  // ============================================================
  panel: {
    title: 'Panel Technology Comparator',
    subtitle: 'Compare IPS, VA, OLED, Mini-LED, and QD-OLED using normalized performance scores. Toggle panel types to overlay them on a radar chart, then inspect detailed strengths and tradeoffs.',
    selectPanels: 'Select Panels',
    selectPanelsDesc: 'Choose one or more panel technologies to compare.',
    radarComparison: 'Radar Comparison',
    specComparison: 'Specification Comparison',
    panelTechnologies: 'Panel Technologies',
    bestByUseCase: 'Best Panel by Use Case',
    emptyTable: 'Select at least one panel technology to show comparison data.',
    spec: 'Spec',
    pros: 'Pros',
    cons: 'Cons',
    bestFor: 'Best For',
    // Price ranges
    priceBudget: 'Budget',
    priceMid: 'Mid-Range',
    pricePremium: 'Premium',
    priceFlagship: 'Flagship',
    // Use cases
    useCaseGaming: 'Gaming',
    useCaseEditing: 'Video/Photo Editing',
    useCaseOffice: 'Office/Productivity',
    useCaseHdr: 'HDR Content',
    useCaseGeneral: 'General Use',
    reasonGaming: 'Fast response time, perfect black levels, and very high color performance.',
    reasonEditing: 'Top color reproduction with wide viewing angle stability.',
    reasonOffice: 'Wide viewing angles, practical pricing, and long service life.',
    reasonHdr: 'High brightness output with local dimming and strong contrast control.',
    reasonGeneral: 'Balanced performance profile with reasonable total ownership cost.',
    // SEO
    seoTitle: 'Panel Technology Comparator - Display Lab',
    seoDesc: 'Compare panel technologies side by side: IPS, VA, OLED, Mini-LED, and QD-OLED with interactive radar charts and detailed specs.',
  },

  // ============================================================
  // SEO (Home page)
  // ============================================================
  seo: {
    homeTitle: 'Display Lab - Professional Display Analysis Tools',
    homeDesc: 'Free web-based tools for display engineers: viewing angle analysis, color gamut comparison, and color science calculations.',
  },
} as const;

export default en;

export type TranslationKeys = typeof en;
