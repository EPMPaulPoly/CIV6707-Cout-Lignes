import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

interface TransitStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface TransitLine {
  id: number;
  name: string;
  description: string;
  mode: string;
}

interface TransportMode {
  id: number;
  name: string;
  costPerKm: number;
  costPerStation: number;
  footprint: number;
}

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152, -73.61368]; // Montreal coordinates

  const [transitStops, setTransitStops] = useState<TransitStop[]>([
    { id: 1, name: 'Montreal Central', latitude: 45.549152, longitude: -73.61368 },
  ]);

  const [transitLines, setTransitLines] = useState<TransitLine[]>([
    { id: 1, name: 'Green Line', description: 'East-West Line', mode: 'Metro' },
  ]);

  const [transportModes, setTransportModes] = useState<TransportMode[]>([
    { id: 1, name: 'Metro', costPerKm: 100, costPerStation: 1000000, footprint: 50 },
  ]);

  const [editingItem, setEditingItem] = useState<{ table: string; id: number | null }>({ table: '', id: null });

  const handleEdit = (table: string, id: number) => {
    setEditingItem({ table, id });
  };

  const handleSave = (table: string) => {
    setEditingItem({ table: '', id: null });
  };

  const handleChange = (table: string, id: number, field: string, value: string | number) => {
    switch (table) {
      case 'transitStops':
        setTransitStops(prevData =>
          prevData.map(item =>
            item.id === id ? { ...item, [field]: field === 'name' ? value : parseFloat(value as string) } : item
          )
        );
        break;
      case 'transitLines':
        setTransitLines(prevData =>
          prevData.map(item =>
            item.id === id ? { ...item, [field]: value } : item
          )
        );
        break;
      case 'transportModes':
        setTransportModes(prevData =>
          prevData.map(item =>
            item.id === id ? { ...item, [field]: field === 'name' ? value : parseFloat(value as string) } : item
          )
        );
        break;
    }
  };

  const handleAdd = (table: string) => {
    switch (table) {
      case 'transitStops':
        const newStopId = Math.max(...transitStops.map(item => item.id)) + 1;
        setTransitStops([...transitStops, { id: newStopId, name: '', latitude: 0, longitude: 0 }]);
        setEditingItem({ table, id: newStopId });
        break;
      case 'transitLines':
        const newLineId = Math.max(...transitLines.map(item => item.id)) + 1;
        setTransitLines([...transitLines, { id: newLineId, name: '', description: '', mode: '' }]);
        setEditingItem({ table, id: newLineId });
        break;
      case 'transportModes':
        const newModeId = Math.max(...transportModes.map(item => item.id)) + 1;
        setTransportModes([...transportModes, { id: newModeId, name: '', costPerKm: 0, costPerStation: 0, footprint: 0 }]);
        setEditingItem({ table, id: newModeId });
        break;
    }
  };

  const renderTable = (table: string, data: any[], columns: string[]) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {columns.map(col => (
                <td key={col}>
                  {editingItem.table === table && editingItem.id === item.id ? (
                    col === 'mode' && table === 'transitLines' ? (
                      <select
                        value={item[col]}
                        onChange={(e) => handleChange(table, item.id, col, e.target.value)}
                      >
                        {transportModes.map(mode => (
                          <option key={mode.id} value={mode.name}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={typeof item[col] === 'number' ? 'number' : 'text'}
                        value={item[col]}
                        onChange={(e) => handleChange(table, item.id, col, e.target.value)}
                      />
                    )
                  ) : (
                    item[col]
                  )}
                </td>
              ))}
              <td>
                {editingItem.table === table && editingItem.id === item.id ? (
                  <button onClick={() => handleSave(table)}>Save</button>
                ) : (
                  <button onClick={() => handleEdit(table, item.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handleAdd(table)}>Add New</button>
    </div>
  );

  return (
    <div className="app">
      <h1>Transit Planning Application</h1>
      <div className="content-wrapper">
        <div className="left-column">
          <h2>Transit Lines</h2>
          {renderTable('transitLines', transitLines, ['name', 'description', 'mode'])}
          <h2>Transport Modes</h2>
          {renderTable('transportModes', transportModes, ['name', 'costPerKm', 'costPerStation', 'footprint'])}
        </div>
        <div className="center-column">
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
              {transitStops.map(stop => (
                <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                  <Popup>{stop.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
        <div className="right-column">
          <h2>Transit Stops</h2>
          {renderTable('transitStops', transitStops, ['name', 'latitude', 'longitude'])}
        </div>
      </div>
    </div>
  );
};

export default App;