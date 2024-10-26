import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { TransitStop, TransitLine, LineStop } from './types';
import { MapHandlers } from './utils';

interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  position: LatLngExpression;
  onStopAdd: MapHandlers['handleStopAdd'];
  onStopMove: MapHandlers['handleStopMove'];
  onStopDelete: MapHandlers['handleStopDelete'];
}

const StationIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

const MapInteractionHandler: React.FC<{
  onStopAdd: (lat: number, lng: number) => void;
  isAddingStop: boolean;
  setIsAddingStop: (value: boolean) => void;
}> = ({ onStopAdd, isAddingStop, setIsAddingStop }) => {
  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      if (isAddingStop) {
        onStopAdd(e.latlng.lat, e.latlng.lng);
        setIsAddingStop(false);
      }
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (isAddingStop) {
        // You could add visual feedback here if desired
        map.getContainer().style.cursor = 'crosshair';
      } else {
        map.getContainer().style.cursor = '';
      }
    }
  });
  return null;
};

const Map: React.FC<MapProps> = ({
  transitStops,
  transitLines,
  lineStops,
  position,
  onStopAdd,
  onStopMove,
  onStopDelete,
}) => {
  const [isAddingStop, setIsAddingStop] = useState(false);

  const getLineCoordinates = (lineId: number): LatLngExpression[] => {
    const stops = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop)
      .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
      .filter((stop): stop is TransitStop => stop !== undefined);

    return stops.map(stop => [stop.latitude!, stop.longitude!]);
  };

  const getLineColor = (line: TransitLine): string => {
    const name = line.name.toLowerCase();
    if (name.includes('green')) return '#00AA00';
    if (name.includes('yellow')) return '#FFD700';
    if (name.includes('red')) return '#FF0000';
    if (name.includes('blue')) return '#0000FF';
    return '#808080'; // Default gray
  };

  return (
    <div className="map-container">
      <div className="map-controls">
        <button
          className={`add-stop-btn ${isAddingStop ? 'active' : ''}`}
          onClick={() => setIsAddingStop(!isAddingStop)}
        >
          {isAddingStop ? 'Cancel Adding Stop' : 'Add New Stop'}
        </button>
        {isAddingStop && (
          <div className="map-controls-help">
            Click anywhere on the map to add a stop
          </div>
        )}
      </div>
      
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapInteractionHandler
          onStopAdd={onStopAdd}
          isAddingStop={isAddingStop}
          setIsAddingStop={setIsAddingStop}
        />

        {/* Render transit lines first so they appear under the stops */}
        {transitLines.map(line => (
          <Polyline
            key={line.id}
            positions={getLineCoordinates(line.id)}
            color={getLineColor(line)}
            weight={4}
            opacity={0.8}
          >
            <Popup>
              <div>
                <strong>{line.name}</strong>
                <br />
                {line.description}
                <br />
                Mode: {line.mode}
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Render transit stops */}
        {transitStops.filter(stop => stop.isComplete).map(stop => {
          const connectedLines = transitLines.filter(line =>
            lineStops.some(ls => ls.line_id === line.id && ls.stop_id === stop.id)
          );

          return (
            <Marker
              key={stop.id}
              position={[stop.latitude!, stop.longitude!]}
              icon={StationIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onStopMove(stop.id, position.lat, position.lng);
                },
              }}
            >
              <Popup>
                <div className="stop-popup">
                  <strong>{stop.name}</strong>
                  <br />
                  {connectedLines.length > 0 && (
                    <>
                      <div className="connected-lines">
                        Lines:
                        <ul>
                          {connectedLines.map(line => (
                            <li key={line.id} style={{ color: getLineColor(line) }}>
                              {line.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <button 
                    className="delete-stop-btn"
                    onClick={() => onStopDelete(stop.id)}
                  >
                    Delete Stop
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;