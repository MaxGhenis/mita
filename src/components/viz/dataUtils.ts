// Data processing utilities
import * as d3 from 'd3';
import districtPolygons from '../../data/districtPolygons.json';
import mitaData from '../../data/mitaData.json';
import { DistrictPolygon, DistrictData, MergedDistrictData, ScatterDataPoint, OutcomeType } from './types';

// Merge polygon and outcome data
export const mergeData = (): MergedDistrictData[] => {
  const outcomeMap = new Map<number, DistrictData>();
  (mitaData as DistrictData[]).forEach(d => outcomeMap.set(d.ubigeo, d));

  return (districtPolygons as DistrictPolygon[]).map(poly => {
    const outcome = outcomeMap.get(poly.ubigeo);
    // Calculate centroid from polygon
    const centroid = d3.polygonCentroid(poly.polygon.map(p => [p[1], p[0]] as [number, number]));
    return {
      ubigeo: poly.ubigeo,
      mita: poly.mita,
      polygon: poly.polygon,
      centroidLon: centroid[0],
      centroidLat: centroid[1],
      distance: outcome?.distance ?? null,
      isInside: outcome?.isInside ?? poly.mita === 1,
      consumption: outcome?.consumption ?? null,
      stunting: outcome?.stunting ?? null,
      roads: outcome?.roads ?? null,
    };
  });
};

// Filter data for scatter plot
export const filterScatterData = (
  mergedData: MergedDistrictData[],
  currentOutcome: OutcomeType
): ScatterDataPoint[] => {
  return mergedData.filter(d => {
    const value = d[currentOutcome];
    // Roads can legitimately be 0; stunting/consumption zeros are likely missing data
    const minValue = currentOutcome === 'roads' ? 0 : 0.001;
    return d.distance !== null && value !== null && value >= minValue;
  }).map(d => {
    const rawValue = d[currentOutcome] as number;
    const value = currentOutcome === 'stunting' ? rawValue * 100 : rawValue;
    const flippedDistance = d.isInside ? Math.abs(d.distance as number) : -Math.abs(d.distance as number);
    return {
      ...d,
      scatterX: flippedDistance,
      scatterY: value,
      stuntingY: d.stunting !== null ? d.stunting * 100 : null,
      consumptionY: d.consumption,
      roadsY: d.roads,
    };
  });
};

// Get all scatter data with any outcome (for transitions)
export const getAllScatterData = (mergedData: MergedDistrictData[]): Omit<ScatterDataPoint, 'scatterY'>[] => {
  return mergedData.filter(d => {
    // Roads can legitimately be 0; stunting/consumption zeros are likely missing data
    return d.distance !== null && (
      (d.stunting !== null && d.stunting > 0) ||
      (d.consumption !== null && d.consumption > 0) ||
      (d.roads !== null && d.roads >= 0)
    );
  }).map(d => {
    const flippedDistance = d.isInside ? Math.abs(d.distance as number) : -Math.abs(d.distance as number);
    return {
      ...d,
      scatterX: flippedDistance,
      scatterY: 0, // Placeholder, use specific outcome Y values
      stuntingY: d.stunting !== null && d.stunting > 0 ? d.stunting * 100 : null,
      consumptionY: d.consumption !== null && d.consumption > 0 ? d.consumption : null,
      roadsY: d.roads !== null && d.roads >= 0 ? d.roads : null,
    };
  });
};

// Helper to get Y value for a given outcome
export const getOutcomeY = (
  d: { stuntingY: number | null; consumptionY: number | null; roadsY: number | null },
  outcomeKey: string
): number | null => {
  if (outcomeKey === 'stunting') return d.stuntingY;
  if (outcomeKey === 'consumption') return d.consumptionY;
  if (outcomeKey === 'roads') return d.roadsY;
  return null;
};

// Tolerance for vertex matching (in degrees, ~100m at Peru's latitude)
const VERTEX_TOLERANCE = 0.001;

// Check if two vertices are approximately equal
const verticesMatch = (v1: [number, number], v2: [number, number]): boolean => {
  return Math.abs(v1[0] - v2[0]) < VERTEX_TOLERANCE &&
         Math.abs(v1[1] - v2[1]) < VERTEX_TOLERANCE;
};

// Check if two polygons share at least one edge (two consecutive shared vertices)
const polygonsShareEdge = (poly1: [number, number][], poly2: [number, number][]): boolean => {
  // For efficiency, first check if bounding boxes overlap
  const getBBox = (poly: [number, number][]) => {
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const [lat, lon] of poly) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
    }
    return { minLat, maxLat, minLon, maxLon };
  };

  const bbox1 = getBBox(poly1);
  const bbox2 = getBBox(poly2);

  // Check if bounding boxes overlap (with tolerance)
  const tol = VERTEX_TOLERANCE * 2;
  if (bbox1.maxLat + tol < bbox2.minLat || bbox2.maxLat + tol < bbox1.minLat ||
      bbox1.maxLon + tol < bbox2.minLon || bbox2.maxLon + tol < bbox1.minLon) {
    return false;
  }

  // Check for shared vertices (at least 2 shared vertices = shared edge)
  let sharedCount = 0;
  for (const v1 of poly1) {
    for (const v2 of poly2) {
      if (verticesMatch(v1, v2)) {
        sharedCount++;
        if (sharedCount >= 2) return true;
      }
    }
  }
  return false;
};

// Compute set of ubigeos for districts that border districts of opposite mita type
export const computeBoundaryDistricts = (mergedData: MergedDistrictData[]): Set<number> => {
  const boundaryUbigeos = new Set<number>();

  const mitaDistricts = mergedData.filter(d => d.mita === 1);
  const nonMitaDistricts = mergedData.filter(d => d.mita === 0);

  // For each mita district, check if it borders any non-mita district
  for (const mita of mitaDistricts) {
    for (const nonMita of nonMitaDistricts) {
      if (polygonsShareEdge(mita.polygon, nonMita.polygon)) {
        boundaryUbigeos.add(mita.ubigeo);
        boundaryUbigeos.add(nonMita.ubigeo);
      }
    }
  }

  return boundaryUbigeos;
};
