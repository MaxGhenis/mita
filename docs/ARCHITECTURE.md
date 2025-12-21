# Visualization Architecture

This document explains the D3.js visualization architecture and documents critical implementation details to prevent regressions.

## Overview

The visualization uses D3.js with SVG to render:
1. A geographic map of Peru's districts
2. A scatter plot showing regression discontinuity data
3. A morphing animation transitioning between the two views

## SVG Structure

```
<svg viewBox="0 0 700 500">
  <g class="main-group" transform="translate(60, 40)">
    <!-- Background rectangles for mita/non-mita regions -->
    <rect class="mita-bg" ... />
    <rect class="nonmita-bg" ... />

    <!-- Scatter plot dots (MUST be here, not on svg directly) -->
    <circle class="morph-dot" ... />

    <!-- Axes, regression lines, etc -->
  </g>
</svg>
```

## Critical Bug: SVG ViewBox and CTM Alignment

### The Problem

**Symptom**: Scatter plot dots appear visually misaligned with the background regions, even though their coordinates are mathematically correct.

**Root Cause**: When using SVG `viewBox` for responsive scaling, elements at different nesting levels receive different Current Transform Matrix (CTM) values from the browser.

### Technical Explanation

The SVG uses `viewBox="0 0 700 500"` with `preserveAspectRatio` to scale responsively. This creates a coordinate transformation that the browser applies via the CTM.

**The bug occurred because:**
1. Background rectangles were rendered inside `<g class="main-group">` (which has `transform="translate(60, 40)"`)
2. Dots were rendered directly on `<svg>` with their own `transform="translate(60, 40)"`
3. Even though both transforms look identical, viewBox scaling applies differently:
   - Elements in nested groups inherit the group's scaled transform
   - Elements directly on svg get a different scaling factor

**Measured CTM values before fix:**
```javascript
// Background (in main-group):
{ a: 0.902, d: 0.902, e: 126.94, f: 84.63 }

// Dots (on svg directly):
{ a: 1.008, d: 1.008, e: 44.51, f: 29.67 }
```

The different `a` (scaleX) and `e` (translateX) values caused ~20-30px visual offset.

**After fix (both in main-group):**
```javascript
// Both elements share the same CTM:
{ a: 0.9155, d: 0.9155, e: 127.74, f: 85.16 }
```

### The Fix

**All rendered elements that need to align must be siblings in the same SVG group.**

In `MorphRenderer.ts`, dots are now rendered to `g` (main-group) instead of `svg`:

```typescript
// CORRECT: Render to g (main-group)
g.selectAll('.morph-dot')
  .data(scatterData)
  .join('circle')
  .attr('cx', ...)  // No transform needed - inherits from group
  .attr('cy', ...);

// WRONG: Don't render to svg directly
svg.selectAll('.morph-dot')
  .attr('transform', `translate(${margin.left},${margin.top})`)  // This causes misalignment!
```

### How to Verify Alignment

Use browser DevTools to check CTM values:

```javascript
// Get CTM for any element
const dot = document.querySelector('.morph-dot');
const bg = document.querySelector('.mita-bg');

console.log('Dot CTM:', dot.getCTM());
console.log('Background CTM:', bg.getCTM());

// These should have identical a, d, e, f values
```

### Files Involved

- `src/components/viz/renderers/MorphRenderer.ts` - Main rendering logic
- `src/components/viz/renderers/ScatterRenderer.ts` - Scatter plot rendering
- `src/components/RDDChart.test.tsx` - Tests documenting this requirement

### Prevention

1. **Never render interactive elements directly to svg** when using viewBox scaling
2. **Always render siblings that need alignment in the same group**
3. **Test with browser DevTools** to verify CTM values match
4. **Run the coordinate system alignment tests** in `RDDChart.test.tsx`

## Other Important Notes

### Dot Position Clamping

Dots must be clamped to plot bounds to prevent them from appearing outside the visible area:

```typescript
.attr('cx', d => Math.max(0, Math.min(xScale.range()[1], xScale(d.scatterX))))
.attr('cy', d => Math.max(0, Math.min(yScale.range()[0], yScale(d.scatterY))))
```

This is especially important during the morph animation when dots interpolate from map coordinates to scatter coordinates.

### Coordinate System

- Map view: Geographic projection coordinates
- Scatter view: Linear scale with distance on x-axis, outcome on y-axis
- During morph: Linear interpolation between the two coordinate systems
