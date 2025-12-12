// Color constants for the mita visualization
// SINGLE SOURCE OF TRUTH - change colors here to update everywhere
//
// Design System: "Colonial Archive Meets Mining Data"
// - Mining rock darks (anthracite, obsidian) for mita regions
// - Weathered stone grays for non-mita
// - Terracotta accents (Peruvian textiles, earth)
// - Parchment backgrounds (colonial documents)

// =============================================================================
// COLOR PALETTE - Mining Rock with Depth
// =============================================================================

// Main mita palette - anthracite/obsidian inspired
const MITA_PALETTE = {
  main: '#1a1e28',      // Anthracite - deep blue-black rock
  dark: '#12151c',      // Deeper ore
  darker: '#0a0c10',    // Obsidian depths
};

// =============================================================================
// EXPORTED COLORS
// =============================================================================

export const colors = {
  // Mita (treatment) colors - mining rock inspired
  mita: MITA_PALETTE.main,
  mitaDark: MITA_PALETTE.dark,
  mitaDarker: MITA_PALETTE.darker,
  mitaStroke: '#363d4d',          // Lighter stroke for visible borders
  mitaLabel: '#f0ece4',           // Parchment for labels on dark

  // Non-mita (control) colors - weathered stone
  nonmita: '#718096',             // Medium gray - stroke
  nonmitaLight: '#a0aec0',        // Light gray - fill

  // UI colors
  textDark: '#0a0c10',            // Near black
  textBody: '#2d3748',            // Body text
  textLight: '#f0ece4',           // Light text for dark backgrounds
  textMuted: '#5a6578',           // Muted text
  white: '#FFFFFF',
  black: '#0a0c10',

  // Backgrounds - parchment/paper
  parchment: '#f8f4e8',
  parchmentDark: '#ebe5d6',
  parchmentCream: '#fdfbf5',

  // Grays
  grayLight: '#ebe5d6',           // Use parchment-dark for consistency
  gray: '#5a6578',
  grayDark: '#1a1e28',

  // Grid
  gridLine: '#d4d0c4',

  // Accent: Terracotta (Peruvian earth)
  terracotta: '#c44536',
  terracottaDark: '#9e3a2d',
  terracottaLight: '#e07a6d',

  // Secondary: Oxidized copper
  copper: '#2a9d8f',
  copperDark: '#1f7268',

  // Gold/ochre highlights
  ochre: '#d4a373',
  ochreLight: '#e5c9a8',

  // Effect annotation colors
  effectLine: '#f8f4e8',          // Parchment for effect line
  effectBg: '#0a0c10',            // Deep black for effect label
} as const;

// RGB versions for CSS rgba() usage
export const colorsRGB = {
  mita: hexToRgb(MITA_PALETTE.main),
  mitaDark: hexToRgb(MITA_PALETTE.dark),
  nonmita: hexToRgb(colors.nonmita),
  nonmitaLight: hexToRgb(colors.nonmitaLight),
  grayLight: '235, 229, 214',     // parchment-dark
  gray: '90, 101, 120',
  grayDark: '26, 30, 40',
  black: '10, 12, 16',
  parchment: '248, 244, 232',
  terracotta: '196, 69, 54',
} as const;

// Helper to convert hex to RGB string
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Convenience function for components
export const getMitaColor = (isInside: boolean, variant: 'fill' | 'stroke' = 'fill') => {
  if (isInside) {
    return variant === 'fill' ? colors.mita : colors.mitaStroke;
  }
  return variant === 'fill' ? colors.nonmitaLight : colors.nonmita;
};

// Generate CSS custom properties (for injecting into document)
export const generateCSSVariables = () => `
  --mita: ${colors.mita};
  --mita-dark: ${colors.mitaDark};
  --mita-darker: ${colors.mitaDarker};
  --nonmita: ${colors.nonmita};
  --nonmita-light: ${colors.nonmitaLight};
  --mita-rgb: ${colorsRGB.mita};
  --mita-dark-rgb: ${colorsRGB.mitaDark};
  --nonmita-rgb: ${colorsRGB.nonmita};
  --terracotta: ${colors.terracotta};
  --terracotta-dark: ${colors.terracottaDark};
  --parchment: ${colors.parchment};
`;
