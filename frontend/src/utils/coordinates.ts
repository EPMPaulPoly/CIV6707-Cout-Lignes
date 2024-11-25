import { LatLng, CRS, Point } from 'leaflet';
import { Position } from '../types/types';

export const leafletToPosition = (latLng: LatLng): Position => {
  const point = CRS.EPSG3857.project(latLng);
  return {
    x: point.x,
    y: point.y
  };
};

export const positionToLeaflet = (position: Position): LatLng => {
  const point = new Point(position.x, position.y);
  return CRS.EPSG3857.unproject(point);
};

export const positionToGeoJSON = (position: Position): [number, number] => {
  const latLng = positionToLeaflet(position);
  return [latLng.lng, latLng.lat];
};

export const geoJSONToPosition = (coordinates: [number, number]): Position => {
  return leafletToPosition(new LatLng(coordinates[1], coordinates[0]));
};