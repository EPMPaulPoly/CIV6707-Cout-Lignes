
import { LatLng } from 'leaflet';
import { TaxLot, TransitStop, TransitLine, LineStop } from '../types/types';

// Helper to determine if a line segment intersects with a polygon
const lineIntersectsPolygon = (
  lineStart: LatLng,
  lineEnd: LatLng,
  polygon: LatLng[],
  bufferDistance: number = 0.003 // About 300m buffer
): boolean => {
  // Check if any point of the polygon is within buffer distance of the line segment
  for (const point of polygon) {
    const distance = pointToLineDistance(point, lineStart, lineEnd);
    if (distance < bufferDistance) return true;
  }
  return false;
};

// Calculate distance from point to line segment
const pointToLineDistance = (point: LatLng, lineStart: LatLng, lineEnd: LatLng): number => {
  const { lat: x, lng: y } = point;
  const { lat: x1, lng: y1 } = lineStart;
  const { lat: x2, lng: y2 } = lineEnd;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

// Get line coordinates from stops
const getLineCoordinates = (
  lineId: number,
  transitStops: TransitStop[],
  lineStops: LineStop[]
): LatLng[] => {
  return lineStops
    .filter(ls => ls.line_id === lineId)
    .sort((a, b) => a.order_of_stop - b.order_of_stop)
    .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
    .filter((stop): stop is TransitStop => stop !== undefined)
    .map(stop => stop.position);
};

// Query lots that intersect with transit lines
const queryLotsNearLines = (
  allLots: TaxLot[],
  transitLines: TransitLine[],
  transitStops: TransitStop[],
  lineStops: LineStop[],
  bufferDistance: number = 0.003 // About 300m buffer
): TaxLot[] => {
  const intersectingLots = new Set<string>();

  // For each transit line
  transitLines.forEach(line => {
    const lineCoords = getLineCoordinates(line.id, transitStops, lineStops);

    // Check each segment of the line
    for (let i = 0; i < lineCoords.length - 1; i++) {
      const start = lineCoords[i];
      const end = lineCoords[i + 1];

      // Find lots that intersect with this segment
      allLots.forEach(lot => {
        if (lineIntersectsPolygon(start, end, lot.polygon, bufferDistance)) {
          intersectingLots.add(lot.id);
        }
      });
    }
  });

  return allLots.filter(lot => intersectingLots.has(lot.id));
};

const generateFullGrid = (): TaxLot[] => {
    // Define the boundaries of Montreal island (approximately)
    const bounds = {
      minLat: 45.41,
      maxLat: 45.71,
      minLng: -73.95,
      maxLng: -73.47
    };
  
    // Size of rectangles
    const width = 0.0008;  // width in degrees (approximately 75-80m)
    const length = width * 1.5; // rectangular lots, 1.5 times longer than wide
    
    // Calculate diagonal spacing to prevent overlap when rotated 45 degrees
    // Need to multiply by sqrt(2) because when rotating, the diagonal becomes the new width/height
    const diagonalSpacing = Math.sqrt(2) * Math.max(width, length) * 1.1; // 10% gap between lots
    
    const lots: TaxLot[] = [];
    let id = 1;
  
    // Rotate counter-clockwise by 45 degrees in radians
    const angle = Math.PI / 4;
  
    // Create grid that covers the entire island
    // Use diagonal coordinates for iteration to maintain 45-degree orientation
    for (let u = bounds.minLat; u <= bounds.maxLat; u += diagonalSpacing) {
      for (let v = bounds.minLng; v <= bounds.maxLng; v += diagonalSpacing) {
        // Calculate center point
        const centerLat = u;
        const centerLng = v;
  
        // Create rectangle corners (before rotation)
        const corners = [
          [-width/2, -length/2], // bottom left
          [width/2, -length/2],  // bottom right
          [width/2, length/2],   // top right
          [-width/2, length/2]   // top left
        ].map(([x, y]) => {
          // Rotate point by 45 degrees
          const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
          const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
          
          // Translate to actual coordinates
          return new LatLng(
            centerLat + rotatedY,
            centerLng + rotatedX
          );
        });
  
        // Generate realistic values based on location
        // Properties closer to downtown (around 45.5, -73.6) are more valuable
        const distanceFromDowntown = Math.sqrt(
          Math.pow(centerLat - 45.5, 2) + 
          Math.pow(centerLng + 73.6, 2)
        );
        
        const baseValue = 1000000; // Base value $1M
        const locationMultiplier = Math.max(0.5, 1.5 - distanceFromDowntown * 5);
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation
        
        const propertyCost = Math.round(baseValue * locationMultiplier * randomVariation / 1000) * 1000;
        const housingUnits = Math.floor(5 + Math.random() * 15); // 5-20 units per lot
  
        lots.push({
          id: `LOT-${String(id).padStart(4, '0')}`,
          propertyCost,
          housingUnits,
          taxBillNumbers: [`T${String(id).padStart(5, '0')}`],
          polygon: corners
        });
  
        id++;
      }
    }
  
    // Filter lots to remove those far from the island (crude approximation)
    const montrealShape = [
      [45.41, -73.95], // SW
      [45.71, -73.75], // NW
      [45.71, -73.47], // NE
      [45.41, -73.57], // SE
    ];
  
    const filteredLots = lots.filter(lot => {
      const centerLat = lot.polygon.reduce((sum, p) => sum + p.lat, 0) / 4;
      const centerLng = lot.polygon.reduce((sum, p) => sum + p.lng, 0) / 4;
      
      // Basic point-in-polygon test
      let inside = false;
      for (let i = 0, j = montrealShape.length - 1; i < montrealShape.length; j = i++) {
        const [lat1, lng1] = montrealShape[i];
        const [lat2, lng2] = montrealShape[j];
  
        const intersect = ((lng1 > centerLng) !== (lng2 > centerLng)) &&
          (centerLat < (lat2 - lat1) * (centerLng - lng1) / (lng2 - lng1) + lat1);
        
        if (intersect) inside = !inside;
      }
  
      return inside;
    });
  
    return filteredLots;
  };


export { generateFullGrid, queryLotsNearLines };