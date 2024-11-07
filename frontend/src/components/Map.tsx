import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Polygon } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent, LatLng } from 'leaflet';
import { TransitStop, TransitLine, LineStop, TaxLot, InsertPosition, TransportMode } from '../types/types';
import { MapHandlers } from '../utils/utils';

interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  transportModes: TransportMode[];
  position: LatLngExpression;
  onStopAdd: (position: LatLng) => void;
  onStopMove: (stopId: number, position: LatLng) => void;
  onStopDelete: (stopId: number) => void;
  onStopEdit: (stopId: number) => void;
  onStopSave: (stopId: number) => void;
  onStopCancel: (stopId: number) => void;
  isAddingNewStop: boolean;
  editingItem: { table: string; id: number | null };
  selectedLine: number | null;
  onStopSelect?: (stopId: number, position: { type: 'first' | 'last' | 'after'; afterStopId?: number }) => void;
  isSelectingStops?: boolean;
  TaxLotData?: TaxLot[];
  insertPosition?: InsertPosition;
}

// Style simple pour l'icône en mode édition - teinte verte
const editingMarkerStyle = `
  .editing-marker {
    filter: hue-rotate(195deg) brightness(1.3);
  }
  .map-helper-text {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  .stop-button {
    padding: 4px 8px;
    margin: 4px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .edit-button {
    background-color: #EAB308;
    color: white;
  }
  .edit-button:hover {
    background-color: #CA8A04;
  }
  .delete-button {
    background-color: #EF4444;
    color: white;
  }
  .delete-button:hover {
    background-color: #DC2626;
  }
  .add-button {
    background-color: #3B82F6;
    color: white;
  }
  .add-button:hover {
    background-color: #2563EB;
  }
  .save-button {
    background-color: #22C55E !important;
    color: white !important;
  }
  .save-button:hover {
    background-color: #16A34A !important;
  }
  .cancel-button {
    background-color: #EF4444 !important;
    color: white !important;
  }
  .cancel-button:hover {
    background-color: #DC2626 !important;
  }
`;

const StationIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

const EditingStationIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
  className: 'editing-marker'
});

const MapInteractionHandler: React.FC<{
  isAddingNewStop: boolean;
  onStopAdd: (position: LatLng) => void;
}> = ({ isAddingNewStop, onStopAdd }) => {
  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      console.log('Map clicked:', {
        isAddingNewStop,
        pos: e.latlng
      });
      if (isAddingNewStop) {
        onStopAdd(e.latlng);
      }
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (isAddingNewStop) {
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
  transportModes,
  position,
  onStopAdd,
  onStopMove,
  onStopDelete,
  onStopEdit,
  onStopSave,
  onStopCancel,
  isAddingNewStop,
  editingItem,
  selectedLine,
  onStopSelect,
  isSelectingStops,
  TaxLotData = [],
  insertPosition
}) => {
  useEffect(() => {
    console.log('Map received transportModes:', transportModes);
  }, [transportModes]);

  const getLineCoordinates = (lineId: number): LatLngExpression[] => {
    const stops = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop)
      .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
      .filter((stop): stop is TransitStop => stop !== undefined);

    return stops.map(stop => stop.position!);
  };

  const getModeName = (mode_id: number) => {
    if (!Array.isArray(transportModes)) {
      console.error('transportModes is not an array:', transportModes);
      return 'Unknown Mode';
    }
    return transportModes.find(mode => mode.id === mode_id)?.name ?? 'Unknown Mode';
  }

  const isStopBeingEdited = (stopId: number): boolean => {
    return editingItem.table === 'transitStops' && editingItem.id === stopId;
  };

  const getLineColor = (line: TransitLine | undefined): string => {
    if (!line) return '#808080';
    const color: string = line.color;
    return color || '#808080';
  };

  return (
    <div className="map-container">
      <style>{editingMarkerStyle}</style>
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
        {/*
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
        ))}*/}

        {/* Render transit lines first so they appear under the stops */}
        {transitLines.map(line => (
          <Polyline
            key={`${line.id}-${line.color}`}
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
              Mode: {getModeName(line.mode_id)}
            </Popup>
          </Polyline>
        ))}

        {transitStops.filter(stop => stop.isComplete).map(stop => (
          <Marker
            key={stop.id}
            position={stop.position!}
            icon={isStopBeingEdited(stop.id) ? EditingStationIcon : StationIcon}
            draggable={isStopBeingEdited(stop.id)}
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
                if (isStopBeingEdited(stop.id)) {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onStopMove(stop.id, position);
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
                        • {line.name} ({getModeName(line.mode_id)})
                      </div>
                    ) : null;
                  })}
                <div className="flex gap-2 mt-2">
                  {isSelectingStops ? (
                    <button
                      className="stop-button add-button"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onStopSelect?.(stop.id, insertPosition || { type: 'last' });
                      }}
                    >
                      Add to Line
                    </button>
                   ) : isStopBeingEdited(stop.id) ? (
                    <>
                      <button
                        className="stop-button save-button"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onStopSave(stop.id);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="stop-button cancel-button"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onStopCancel(stop.id);
                        }}
                      >
                        Cancel
                      </button>
                     </>
                   ) : (
                    <>
                      <button
                        className="stop-button edit-button"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onStopEdit(stop.id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="stop-button delete-button"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onStopDelete(stop.id);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                {isStopBeingEdited(stop.id) && (
                  <div className="text-sm text-gray-600 mt-2">
                    Drag the marker to move the stop
                  </div>
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