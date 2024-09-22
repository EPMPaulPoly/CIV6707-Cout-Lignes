// File: frontend/src/App.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const MapContent: React.FC = () => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(position, 13);
  }, [map]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          A sample marker in Montreal
        </Popup>
      </Marker>
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>My Map Application</h1>
      <div className="map-container">
        <MapContainer style={{ height: '90%', width: '100%' }}>
          <MapContent />
        </MapContainer>
      </div>
    </div>
  );
};

export default App;