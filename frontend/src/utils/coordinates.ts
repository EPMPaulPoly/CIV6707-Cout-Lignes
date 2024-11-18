import { LatLng } from 'leaflet';
import { Position } from '../types/types';

export const leafletToPosition = (latLng: LatLng): Position => {
  return {
    x: latLng.lng,
    y: latLng.lat
  };
};

export const positionToLeaflet = (position: Position): LatLng => {
  return new LatLng(position.y, position.x);
};

export const positionToGeoJSON = (position: Position): [number, number] => {
  return [position.x, position.y];
};

export const geoJSONToPosition = (coordinates: [number, number]): Position => {
  return {
    x: coordinates[0],
    y: coordinates[1]
  };
};