import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { LatLngExpression } from 'leaflet';
import { TransitStop, TransitLine, LineStop } from './types';

interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  position: LatLngExpression;
}

const Map: React.FC<MapProps> = ({ transitStops, transitLines, lineStops, position }) => {
  const largerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
  });

  const getLineCoordinates = (lineId: number) => {
    const stopsForLine = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop);

    return stopsForLine.map(ls => {
      const stop = transitStops.find(s => s.id === ls.stop_id);
      return stop ? [stop.latitude, stop.longitude] as LatLngExpression : null;
    }).filter((coord): coord is LatLngExpression => coord !== null);
  };

  const getLineColor = (index: number) => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[index % colors.length];
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
        {transitLines.map((line, index) => (
          <Polyline
            key={line.id}
            positions={getLineCoordinates(line.id)}
            color={getLineColor(index)}
            weight={4}
            opacity={0.7}
          >
            <Popup>{line.name}</Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;