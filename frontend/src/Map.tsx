
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LatLngExpression } from 'leaflet';
import { TransitStop, TransitLine,LineStop } from './types';


interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  position: LatLngExpression;
  lineStops: LineStop[];
  transitLines: TransitLine[];
}


const Map: React.FC<MapProps> = ({ transitStops, position, lineStops, transitLines }) => {

  const largerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
  });


  const getLineCoordinates = (lineId: number): LatLngExpression[] => {
    const stops = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop)
      .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
      .filter((stop): stop is TransitStop => stop !== undefined);

    return stops.map(stop => [stop.latitude!, stop.longitude!]);
  };
  

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {transitStops.filter(stop => stop.isComplete).map(stop => (
          <Marker 
            key={stop.id} 
            position={[stop.latitude!, stop.longitude!]} 
            icon={largerIcon}
          >
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}
        {transitLines.map(line => (
          <Polyline
            key={line.id}
            positions={getLineCoordinates(line.id)}
            color={line.name.toLowerCase().includes('green') ? 'green' : 'yellow'}
          />
        ))}
        

      </MapContainer>
    </div>
  );
};

export default Map;