import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents,Polygon } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { TransitStop, TransitLine, LineStop, TaxLot,InsertPosition } from './types';
import { MapHandlers } from './utils';

interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  position: LatLngExpression;
  onStopAdd: (lat: number, lng: number) => void;  // Changed to onStopAdd
  onStopMove: (stopId: number, lat: number, lng: number) => void;
  onStopDelete: (stopId: number) => void;
  isAddingNewStop: boolean;
  editingItem: { table: string; id: number | null };
  selectedLine: number | null;
  onStopSelect?: (stopId: number, position: { type: 'first' | 'last' | 'after'; afterStopId?: number }) => void;
  isSelectingStops?: boolean;
  TaxLotData?: TaxLot[];
  insertPosition?: InsertPosition;
}

interface MapInteractionHandlerProps {
  isAddingNewStop: boolean;
  onStopAdd: (lat: number, lng: number) => void;  // Changed to match
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
  isAddingNewStop: boolean;  // Changed from isAddingStop
  onStopAdd: (lat: number, lng: number) => void;
}> = ({ isAddingNewStop, onStopAdd }) => {  // Changed from isAddingStop
  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      console.log('Map clicked:', { 
        isAddingNewStop,
        lat: e.latlng.lat,
        lng: e.latlng.lng 
      });
      if (isAddingNewStop) {  // Changed from isAddingStop
        onStopAdd(e.latlng.lat, e.latlng.lng);
      }
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (isAddingNewStop) {  // Changed from isAddingStop
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
  isAddingNewStop,
  editingItem,
  selectedLine,
  onStopSelect,
  isSelectingStops,
  TaxLotData = [],
  insertPosition
}) => {

  const getLineCoordinates = (lineId: number): LatLngExpression[] => {
    const stops = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop)
      .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
      .filter((stop): stop is TransitStop => stop !== undefined);

    return stops.map(stop => [stop.latitude!, stop.longitude!]);
  };

  const isStopBeingEdited = (stopId: number): boolean => {
    return editingItem.table === 'transitStops' && editingItem.id === stopId;
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
      {isAddingNewStop && (
        <div className="map-helper-text">
          Click on the map to place the new stop
        </div>
      )}
      {isSelectingStops && (
        <div className="map-helper-text">
          Click on stops to add them to the selected line
        </div>
      )}
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
          isAddingNewStop={isAddingNewStop}
        />

        {/* Render tax lots first so they appear under everything else */}
        {TaxLotData.map(lot => (
          <Polygon
            key={lot.id}
            positions={lot.polygon}
            pathOptions={{
              color: '#8B4513', // Brown color for lots
              weight: 1,
              fillColor: '#DEB887', // Lighter brown fill
              fillOpacity: 0.3,
              opacity: 0.7
            }}
          >
            <Popup>
              <div>
                <strong>Lot ID: {lot.id}</strong><br />
                Property Cost: ${lot.propertyCost.toLocaleString()}<br />
                Housing Units: {lot.housingUnits}<br />
                Tax Bills: {lot.taxBillNumbers.join(', ')}
              </div>
            </Popup>
          </Polygon>
        ))}

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
              <strong>{line.name}</strong>
                <br />
                {line.description}
                <br />
                Mode: {line.mode}
            </Popup>
          </Polyline>
        ))}

        {transitStops.filter(stop => stop.isComplete).map(stop => (
          <Marker
            key={stop.id}
            position={[stop.latitude!, stop.longitude!]}
            icon={StationIcon}
            draggable={isStopBeingEdited(stop.id)}  // Only draggable when being edited
            eventHandlers={{
              click: (e) => {
                if (isSelectingStops && onStopSelect && insertPosition) {
                  console.log('Clicking stop with position:', insertPosition);
                  e.originalEvent.preventDefault();
                  e.originalEvent.stopPropagation();
                  onStopSelect(stop.id, insertPosition);
                }
              },
              dragend: (e) => {
                if (isStopBeingEdited(stop.id)) {  // Double-check before allowing move
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onStopMove(stop.id, position.lat, position.lng);
                }
              },
            }}
          >
            <Popup>
            <div>
              <strong>{stop.name}</strong>
              <br />
              {lineStops
                .filter(ls => ls.stop_id === stop.id)
                .map(ls => {
                  const line = transitLines.find(l => l.id === ls.line_id);
                  return line ? (
                    <div key={line.id} className="ml-2">
                      • {line.name} ({line.mode})
                    </div>
                  ) : null;
                })}
              {isSelectingStops ? (
                <button onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onStopSelect?.(stop.id, insertPosition || { type: 'last' });
                }}>
                  Add to Line
                </button>
              ) : (
                <button onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onStopDelete(stop.id);
                }}>
                  Delete Stop
                </button>
              )}
            </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;