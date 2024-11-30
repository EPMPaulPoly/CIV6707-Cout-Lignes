import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents,GeoJSON, Polygon, useMap } from 'react-leaflet';
import L, { CRS, LeafletMouseEvent, LatLng, IconOptions } from 'leaflet';
import { TransitStop, TransitLine, LineStop, TaxLot, InsertPosition, TransportMode, Position } from '../types/types';
import { MapHandlers } from '../utils/utils';
import { leafletToPosition, positionToLeaflet } from '../utils/coordinates';

interface MapProps {
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  lineStops: LineStop[];
  transportModes: TransportMode[];
  cadastreLots: GeoJSON.FeatureCollection | null;
  position: { x: number, y: number };
  onStopAdd: (position: { x: number, y: number }) => void;
  onStopMove: (stopId: number, position: { x: number, y: number }) => void;
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

const editingMarkerStyle = `
  .editing-marker {
    filter: hue-rotate(195deg) brightness(1.3);
  }
  .editing-waypoint {
    color: 'red';
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

const WaypointIcon = L.icon({
  iconUrl: 'https://www.svgrepo.com/show/493838/common-point.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, 0],
});

const createEditingWaypointIcon = (color:string) => L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10zm0 3c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/>
      </svg>
  `)}`,
  iconSize: [30, 30],  // Size of the icon
  iconAnchor: [15, 15], // Anchor point for the icon
  popupAnchor: [0, 0],  // Popup position
});

// Example usage
const redWaypointIcon = createEditingWaypointIcon('red');

const EPSG3857_CRS = CRS.EPSG3857;

const MapInteractionHandler: React.FC<{
  isAddingNewStop: boolean;
  onStopAdd: (position: Position) => void;
}> = ({ isAddingNewStop, onStopAdd }) => {
  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      if (isAddingNewStop) {
        const position = leafletToPosition(e.latlng);
        onStopAdd(position);
      }
    },
    mousemove: (e: LeafletMouseEvent) => {
      map.getContainer().style.cursor = isAddingNewStop ? 'crosshair' : '';
    }
  });
  return null;
};

const MapContent: React.FC<MapProps> = ({
  transitStops,
  transitLines,
  lineStops,
  transportModes,
  cadastreLots,
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
  const map = useMap();

  useEffect(() => {
    console.log('Map received transportModes:', transportModes);
  }, [transportModes]);

  const getLineCoordinates = (lineId: number): LatLng[] => {
    const stops = lineStops
      .filter(ls => ls.line_id === lineId)
      .sort((a, b) => a.order_of_stop - b.order_of_stop)
      .map(ls => transitStops.find(ts => ts.id === ls.stop_id))
      .filter((stop): stop is TransitStop => stop !== undefined)
      .map(stop => positionToLeaflet(stop.position));
    return stops;
  };
  const getIconToUse=(stopId:number): L.Icon<IconOptions> =>{
    const stop = transitStops.find(stop => stop.id === stopId);
    if (isStopBeingEdited(stopId) ==true && stop?.isStation===true) {
      return EditingStationIcon;
    } else if (isStopBeingEdited(stopId) && stop?.isStation===false){
      return redWaypointIcon;
    } else if (stop?.isStation===false){
      return WaypointIcon;
    } else{
      return StationIcon;
    }
  };
  const onEachFeature = (feature: any, layer: L.Layer) => {
    // This function is called for each feature
    if (feature.properties) {
      const { ogc_fid, value_total } = feature.properties;

      // Create a popup with the id and value_total
      layer.bindPopup(`
        <strong>ID:</strong> ${ogc_fid}<br />
        <strong>Value Total:</strong> ${value_total}
      `);
    }
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
  const geoJsonStyle = {
    fillColor: 'blue', // Fill color
    weight: 2,         // Border width
    opacity: 1,        // Border opacity
    fillOpacity: 0.5   // Fill opacity
  };
  const getLineColor = (line: TransitLine | undefined): string => {
    if (!line) return '#808080';
    const color: string = line.color;
    return color || '#808080';
  };

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    {cadastreLots && (
      <>
        {cadastreLots.features?.map((feature, index) => {
          console.log(`Feature ${index + 1}:`, feature);
          return null; // We return null because we're only logging, not rendering anything here.
        })}
        <GeoJSON data={cadastreLots} style={geoJsonStyle} onEachFeature={onEachFeature} />
      </>
      )}
      <MapInteractionHandler
        onStopAdd={onStopAdd}
          isAddingNewStop={isAddingNewStop}
      />
      {transitLines.map(line => {
        const coordinates = getLineCoordinates(line.id);
        return (
          <Polyline
            key={line.id}
            positions={coordinates}
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
        );
      })}

      {transitStops.filter(stop => stop.isComplete).map(stop => (
        <Marker
          key={stop.id}
          position={positionToLeaflet(stop.position)}
          icon={getIconToUse(stop.id)}
          draggable={isStopBeingEdited(stop.id)}
          eventHandlers={{
            click: (e) => {
              if (isSelectingStops && onStopSelect && insertPosition) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
                onStopSelect(stop.id, insertPosition);
              }
            },
            dragend: (e) => {
              if (isStopBeingEdited(stop.id)) {
                const marker = e.target;
                const position = leafletToPosition(marker.getLatLng());
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
    </>
  );
};

const Map: React.FC<MapProps> = (props) => {
  return (
    <div className="map-container">
      <style>{editingMarkerStyle}</style>
      {props.isAddingNewStop && (
        <div className="map-helper-text">
          Click on the map to place the new stop
        </div>
      )}
      {props.isSelectingStops && (
        <div className="map-helper-text">
          Click on stops to add them to the selected line
        </div>
      )}
      <MapContainer
        center={[45.508888, -73.671668]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        crs={EPSG3857_CRS}
      >
        <MapContent {...props} />
      </MapContainer>
    </div>
  );
};

export default Map;