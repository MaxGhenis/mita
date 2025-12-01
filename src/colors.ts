// Color constants for the mita visualization
// These should match the CSS variables in App.css

export const colors = {
  // Mita (treatment) colors
  mita: '#e74c3c',
  mitaDark: '#c0392b',
  mitaDarker: '#a33025',

  // Non-mita (control) colors
  nonmita: '#718096',
  nonmitaLight: '#A0AEC0',

  // Text and background
  textDark: '#2D3748',
  gridLine: '#e0e0e0',
} as const;

// Convenience functions
export const getMitaColor = (isInside: boolean, variant: 'fill' | 'stroke' = 'fill') => {
  if (isInside) {
    return variant === 'fill' ? colors.mita : colors.mitaDark;
  }
  return variant === 'fill' ? colors.nonmitaLight : colors.nonmita;
};
