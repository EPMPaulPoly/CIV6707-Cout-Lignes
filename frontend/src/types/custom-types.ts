import { LatLngExpression } from 'leaflet';

declare module 'react-leaflet' {
  interface MapContainerProps {
    center: LatLngExpression;
    zoom: number;
  }

  interface TileLayerProps {
    attribution: string;
  }
}

