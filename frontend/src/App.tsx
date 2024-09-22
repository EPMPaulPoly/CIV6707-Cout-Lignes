// File: frontend/src/App.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152,-73.61368]; // Montreal coordinates

  return (
    <div className="app">
      <h1>My Map Application</h1>
      <div className="map-container">
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              A sample marker in Montreal
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default App;