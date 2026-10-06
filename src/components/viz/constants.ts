// Constants for visualization

// Dell (2010) "The Persistent Effects of Peru's Mining Mita", Econometrica 78(6), pp. 1863-1903
// Polynomial RD estimates with geographic controls (Table 2, Panel B, Column 7)
// consumption: log household equiv. consumption; stunting: fraction of children stunted; roads: m/km²
export const PAPER_COEFFICIENTS = {
  consumption: -0.25, // Table 2, Panel B — ~22% lower consumption
  stunting: 0.06,     // Table 6, Panel A — 6pp higher stunting rate
  roads: -36,         // Table 8, Panel A — 36 fewer m/km² road density
};

export const OUTCOME_LABELS = {
  consumption: 'Log household consumption (2001)',
  stunting: 'Child stunting rate (2005)',
  roads: 'Road density (meters/km², 2006)',
};

export const DEFAULT_DIMENSIONS = {
  width: 700,
  height: 500,
};

export const DEFAULT_MARGIN = {
  top: 40,
  right: 30,
  bottom: 50,
  left: 60,
};

// Animation durations (ms)
export const ANIMATION = {
  morphDuration: 4500,
  zoomDuration: 1500,
  transitionDuration: 600,
  effectDelay: 300,
};

// Morph timing (as fraction of morphProgress)
export const MORPH_TIMING = {
  start: 0.2,
  end: 0.9,
  dotFadeStart: 0.2,
  dotFadeEnd: 0.8,
};

// Opacity values
export const OPACITY = {
  district: 0.85,
  dot: 0.8,
  mapFade: 0.5,
};
