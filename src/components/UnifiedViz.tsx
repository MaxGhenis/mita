import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import southAmerica from '../data/southAmerica.json';
import { colors } from '../colors';
import {
  OutcomeType,
  ScatterPhase,
  ZoomLevel,
  HighlightMode,
  MergedDistrictData,
  DEFAULT_DIMENSIONS,
  DEFAULT_MARGIN,
  OUTCOME_LABELS,
  ANIMATION,
  MORPH_TIMING,
  mergeData,
  filterScatterData,
  getAllScatterData,
  computeBoundaryDistricts,
  createProjection,
  createXScale,
  createYScales,
  getInnerDimensions,
  calculateFittedLines,
  renderMap,
  renderScatterBackgrounds,
  renderScatterLabels,
  renderScatterAxes,
  renderMorph,
  renderFittedLines,
} from './viz';

interface TooltipData {
  x: number;
  y: number;
  district: MergedDistrictData;
}

type DotEmphasis = 'normal' | 'pulse' | 'dimmed';

interface UnifiedVizProps {
  morphProgress: number;
  outcome: OutcomeType;
  showDistricts: boolean;
  scatterPhase: ScatterPhase;
  zoomLevel: ZoomLevel;
  highlightMode?: HighlightMode;
  dotEmphasis?: DotEmphasis;
  showAxisGuide?: boolean;
}

const UnifiedViz: React.FC<UnifiedVizProps> = ({
  morphProgress,
  outcome,
  showDistricts,
  scatterPhase,
  zoomLevel,
  highlightMode = 'none',
  dotEmphasis = 'normal',
  showAxisGuide = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions] = useState(DEFAULT_DIMENSIONS);
  const animationRef = useRef<number | null>(null);
  const zoomAnimationRef = useRef<number | null>(null);
  const borderAnimationRef = useRef<number | null>(null);
  const [currentProgress, setCurrentProgress] = useState(morphProgress);
  const [currentOutcome, setCurrentOutcome] = useState<OutcomeType>(outcome);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel === 'peru' ? 0 : 1);
  const [borderOpacity, setBorderOpacity] = useState(showDistricts ? 1 : 0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const prevScatterPhaseRef = useRef<string>(scatterPhase);
  const prevOutcomeRef = useRef<string>(outcome);

  // Hover handlers
  const handleDistrictHover = useCallback((district: MergedDistrictData | null, event?: MouseEvent) => {
    if (district && event && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        district,
      });
    } else {
      setTooltip(null);
    }
  }, []);

  // Memoized data
  const mergedData = useMemo(() => mergeData(), []);
  const boundaryUbigeos = useMemo(() => computeBoundaryDistricts(mergedData), [mergedData]);
  const { innerWidth, innerHeight } = getInnerDimensions(dimensions, DEFAULT_MARGIN);

  // South America features
  const saFeatures = (southAmerica as any).features;
  const peruFeature = saFeatures.find((f: any) => f.properties?.name === 'Peru');
  const neighborFeatures = saFeatures.filter((f: any) => f.properties?.name !== 'Peru');

  // Animation effects
  useEffect(() => {
    let startProgress = currentProgress;
    const targetProgress = morphProgress;
    const duration = ANIMATION.morphDuration;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const newProgress = startProgress + (targetProgress - startProgress) * eased;
      setCurrentProgress(newProgress);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morphProgress]);

  useEffect(() => {
    setCurrentOutcome(outcome);
  }, [outcome]);

  useEffect(() => {
    const targetZoom = zoomLevel === 'peru' ? 0 : 1;
    let startZoom = currentZoom;
    const duration = ANIMATION.zoomDuration;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const newZoom = startZoom + (targetZoom - startZoom) * eased;
      setCurrentZoom(newZoom);

      if (t < 1) {
        zoomAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    if (zoomAnimationRef.current) cancelAnimationFrame(zoomAnimationRef.current);
    zoomAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (zoomAnimationRef.current) cancelAnimationFrame(zoomAnimationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  useEffect(() => {
    const targetOpacity = showDistricts ? 1 : 0;
    let startOpacity = borderOpacity;
    const duration = 400; // Fade duration in ms
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const newOpacity = startOpacity + (targetOpacity - startOpacity) * eased;
      setBorderOpacity(newOpacity);

      if (t < 1) {
        borderAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    if (borderAnimationRef.current) cancelAnimationFrame(borderAnimationRef.current);
    borderAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (borderAnimationRef.current) cancelAnimationFrame(borderAnimationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDistricts]);

  // Computed data
  const scatterData = useMemo(
    () => filterScatterData(mergedData, currentOutcome),
    [mergedData, currentOutcome]
  );

  const allScatterData = useMemo(
    () => getAllScatterData(mergedData),
    [mergedData]
  );

  const fittedLines = useMemo(
    () => calculateFittedLines(scatterData, currentOutcome),
    [scatterData, currentOutcome]
  );

  // Main render effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = DEFAULT_MARGIN;
    const t = currentProgress;

    // Transition detection
    const isOutcomeOnlyTransition = t >= 1 && prevOutcomeRef.current !== currentOutcome && prevOutcomeRef.current !== '';
    const isPhaseTransition = t >= 1 && prevScatterPhaseRef.current !== scatterPhase && prevScatterPhaseRef.current !== '';
    const isAtFullScatter = t >= 1;
    const shouldPreserveElements = isOutcomeOnlyTransition || isPhaseTransition;

    // Clear elements appropriately
    if (shouldPreserveElements || isAtFullScatter) {
      svg.selectAll('*:not(.morph-dot):not(.inside-line):not(.outside-line):not(.effect-line):not(.effect-label-rect):not(.effect-label-text):not(.main-group)').remove();
    } else {
      svg.selectAll('*').remove();
    }

    // Get or create main group
    let g = svg.select<SVGGElement>('.main-group');
    if (g.empty()) {
      g = svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    } else {
      // Always clear non-essential elements from main group
      // Keep only elements that should persist across renders
      g.selectAll('.morphing-district, .fading-district, .district, .district-bg').remove();
    }

    // Create projection and scales
    const projection = createProjection({
      mergedData,
      peruFeature,
      currentZoom,
      innerWidth,
      innerHeight,
    });
    const xScale = createXScale(innerWidth);
    const yScales = createYScales(allScatterData as any, innerHeight);
    const yScale = yScales[currentOutcome];

    // Render scatter backgrounds and labels (always, opacity controlled by t)
    renderScatterBackgrounds({ g, xScale, innerHeight, t });
    renderScatterLabels({ g, xScale, t });
    renderScatterAxes({ g, xScale, yScale, innerWidth, innerHeight, currentOutcome, t });

    // Scatter ubigeos for filtering
    const scatterUbigeos = new Set(scatterData.map(d => d.ubigeo));

    // Render based on progress
    if (t < 0.3) {
      // Map phase
      const polygonOpacity = 1 - (t / 0.3) * 0.3;

      renderMap({
        g,
        projection,
        mergedData,
        peruFeature,
        neighborFeatures,
        currentZoom,
        polygonOpacity,
        borderOpacity,
        showDistricts,
        innerWidth,
        innerHeight,
        highlightMode,
        boundaryUbigeos,
        onHover: handleDistrictHover,
      });
    } else {
      // Morph/scatter phase
      const morphT = Math.min((t - MORPH_TIMING.start) / (MORPH_TIMING.end - MORPH_TIMING.start), 1);

      renderMorph({
        g,
        svg,
        projection,
        xScale,
        yScale,
        mergedData,
        scatterData,
        allScatterData: allScatterData as any,
        scatterUbigeos,
        morphT,
        currentOutcome,
        margin,
        innerHeight,
        isOutcomeTransition: isOutcomeOnlyTransition,
        isPhaseTransition,
        onHover: handleDistrictHover,
      });
    }

    // Fitted lines and effect annotation (only at full scatter)
    if (t >= 1) {
      renderFittedLines({
        svg,
        fittedLines,
        scatterPhase,
        prevScatterPhase: prevScatterPhaseRef.current,
        xScale,
        yScale,
        margin,
        currentOutcome,
        shouldPreserveElements,
      });

      prevScatterPhaseRef.current = scatterPhase;
    }

    prevOutcomeRef.current = currentOutcome;

  }, [currentProgress, currentOutcome, scatterPhase, mergedData, scatterData, allScatterData, fittedLines, dimensions, showDistricts, currentZoom, borderOpacity, innerWidth, innerHeight, peruFeature, neighborFeatures, handleDistrictHover, highlightMode, boundaryUbigeos]);

  const getTitle = () => {
    if (currentProgress < 0.3) return 'The mita boundary';
    return OUTCOME_LABELS[currentOutcome];
  };

  return (
    <div className="unified-viz" style={{ position: 'relative' }}>
      <h3 className="chart-title">{getTitle()}</h3>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className={dotEmphasis !== 'normal' ? `dot-emphasis-${dotEmphasis}` : ''}
        style={{
          maxWidth: '100%',
          height: 'auto',
          background: currentProgress < 0.3 ? colors.parchmentDark : 'transparent',
          transition: 'background 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRadius: '4px',
        }}
      />
      {currentProgress < 0.3 && (
        <div className="map-legend" style={{ opacity: 1 - currentProgress * 3 }}>
          <div className="legend-item">
            <span className="legend-color mita-region"></span>
            <span>Mita region</span>
          </div>
          <div className="legend-item">
            <span className="legend-color outside-region"></span>
            <span>Non-mita region</span>
          </div>
        </div>
      )}
      {/* Axis guide overlay for rdd-intro step */}
      {showAxisGuide && currentProgress >= 1 && (
        <div
          className="axis-guide-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          {/* X-axis guide */}
          <div
            style={{
              position: 'absolute',
              bottom: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: colors.parchmentCream,
                padding: '4px 10px',
                borderRadius: '3px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `1px solid ${colors.terracotta}`,
              }}
            >
              <span style={{ color: colors.mita, fontSize: '16px' }}>←</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: colors.terracottaDark,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Distance
              </span>
              <span style={{ color: colors.nonmita, fontSize: '16px' }}>→</span>
            </div>
          </div>
          {/* Y-axis guide */}
          <div
            style={{
              position: 'absolute',
              left: '8%',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: colors.parchmentCream,
                padding: '4px 10px',
                borderRadius: '3px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `1px solid ${colors.terracotta}`,
              }}
            >
              <span style={{ color: colors.terracotta, fontSize: '14px' }}>↑</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: colors.terracottaDark,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Outcome
              </span>
            </div>
          </div>
        </div>
      )}
      {tooltip && (
        <div
          className="district-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x + 12,
            top: tooltip.y - 12,
            background: colors.mita,
            color: colors.textLight,
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 4px 16px rgba(10, 12, 16, 0.4)',
            maxWidth: '200px',
            border: `1px solid ${colors.mitaStroke}`,
          }}
        >
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '6px',
            color: colors.parchment,
            letterSpacing: '-0.01em',
          }}>
            District {tooltip.district.ubigeo}
          </div>
          <div style={{
            color: tooltip.district.mita === 1 ? colors.ochreLight : colors.nonmitaLight,
            textTransform: 'uppercase',
            fontSize: '10px',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}>
            {tooltip.district.mita === 1 ? 'Mita region' : 'Non-mita region'}
          </div>
          {tooltip.district.distance !== null && (
            <div style={{ opacity: 0.85 }}>
              {Math.abs(tooltip.district.distance).toFixed(1)} km {tooltip.district.isInside ? 'inside' : 'outside'}
            </div>
          )}
          {currentOutcome === 'stunting' && tooltip.district.stunting !== null && (
            <div style={{ marginTop: '4px', color: colors.terracottaLight }}>
              Stunting: {(tooltip.district.stunting * 100).toFixed(1)}%
            </div>
          )}
          {currentOutcome === 'consumption' && tooltip.district.consumption !== null && (
            <div style={{ marginTop: '4px', color: colors.terracottaLight }}>
              Consumption: {tooltip.district.consumption.toFixed(2)}
            </div>
          )}
          {currentOutcome === 'roads' && tooltip.district.roads !== null && (
            <div style={{ marginTop: '4px', color: colors.terracottaLight }}>
              Roads: {tooltip.district.roads.toFixed(0)} m/km²
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedViz;
