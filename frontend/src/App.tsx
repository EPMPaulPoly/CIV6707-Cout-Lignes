import React, { useState,useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';

interface TransitStop {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  isComplete: boolean;
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

interface LineStop {
  id: number;
  line_id: number;
  stop_id: number;
  order_of_stop: number;
  is_station: boolean;
}

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152, -73.61368]; // Montreal coordinates

  const [transitStops, setTransitStops] = useState<TransitStop[]>([
    { id: 1, name: 'Montreal Central', latitude: 45.549152, longitude: -73.61368, isComplete: true },
    { id: 2, name: 'EO 1', latitude: 45.53, longitude: -73.63, isComplete: true },
    { id: 3, name: 'EO 2', latitude: 45.57, longitude: -73.6, isComplete: true },
    { id: 4, name: 'NS 1', latitude: 45.56, longitude: -73.64, isComplete: true },
    { id: 5, name: 'NS 1', latitude: 45.54, longitude: -73.59, isComplete: true },
  ]);

  const [transitLines, setTransitLines] = useState<TransitLine[]>([
    { id: 1, name: 'Green Line', description: 'East-West Line', mode: 'Metro' },
    { id: 2, name: 'Yellow Line', description: 'NS Line', mode: 'Tram' },
  ]);

  const [transportModes, setTransportModes] = useState<TransportMode[]>([
    { id: 1, name: 'Metro', costPerKm: 1000, costPerStation: 0.2, footprint: 50 },
    { id: 2, name: 'Tran', costPerKm: 70, costPerStation: 0.07, footprint: 20 },
  ]);

  const [editingItem, setEditingItem] = useState<{ table: string; id: number | null }>({ table: '', id: null });

  const [lineStops, setLineStops] = useState<LineStop[]>([
    { id: 1, line_id: 1, stop_id: 2, order_of_stop: 1, is_station: true },
    { id: 2, line_id: 1, stop_id: 1, order_of_stop: 2, is_station: true },
    { id: 3, line_id: 1, stop_id: 3, order_of_stop: 3, is_station: true },
    { id: 4, line_id: 2, stop_id: 4, order_of_stop: 1, is_station: true },
    { id: 5, line_id: 2, stop_id: 1, order_of_stop: 2, is_station: true },
    { id: 6, line_id: 2, stop_id: 5, order_of_stop: 3, is_station: true },
  ]);

  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const largerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [30, 45],  // Slightly larger than the default [25, 41]
    iconAnchor: [15, 45],
    popupAnchor: [0, -45]
  });

  useEffect(() => {
    if (transitLines.length > 0 && selectedLine === null) {
      setSelectedLine(transitLines[0].id);
    }
  }, [transitLines, selectedLine]);

  const handleEdit = (table: string, id: number) => {
    setEditingItem({ table, id });
  };

  const handleSave = (table: string) => {
    switch (table) {
      case 'transitStops':
        setTransitStops(prevData =>
          prevData.map(item =>
            item.id === editingItem.id ? { 
              ...item, 
              isComplete: item.name !== '' && item.latitude !== null && item.longitude !== null
            } : item
          )
        );
        break;
      case 'transitLines':
        // Add logic for saving transit lines if needed
        break;
      case 'transportModes':
        // Add logic for saving transport modes if needed
        break;
      case 'lineStops':
        // Add logic for saving line stops if needed
        break;
    }
    setEditingItem({ table: '', id: null });
  };
  

  const handleChange = (table: string, id: number, field: string, value: string | number) => {
    switch (table) {
      case 'transitStops':
        setTransitStops(prevData =>
          prevData.map(item =>
            item.id === id ? { 
              ...item, 
              [field]: field === 'name' ? value : (value === '' ? null : parseFloat(value as string) || 0)
            } : item
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
        setTransitStops([...transitStops, { id: newStopId, name: '', latitude: 0, longitude: 0 ,isComplete: false}]);
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



  const handleLineSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLine(Number(event.target.value));
  };

  const handleAddLineStop = () => {
    if (selectedLine === null) return;

    const newLineStopId = Math.max(...lineStops.map(item => item.id), 0) + 1;
    const newOrderOfStop = Math.max(...lineStops.filter(stop => stop.line_id === selectedLine).map(stop => stop.order_of_stop), 0) + 1;
    
    setLineStops([...lineStops, {
      id: newLineStopId,
      line_id: selectedLine,
      stop_id: transitStops[0]?.id || 0,
      order_of_stop: newOrderOfStop,
      is_station: false
    }]);
    setEditingItem({ table: 'lineStops', id: newLineStopId });
  };

  const handleChangeLineStop = (id: number, field: string, value: string | number | boolean) => {
    setLineStops(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: field === 'is_station' ? Boolean(value) : (field === 'stop_id' || field === 'order_of_stop' ? Number(value) : value) } : item
      )
    );
  };

  const renderLineStopsTable = () => {
    const filteredStops = lineStops.filter(stop => stop.line_id === selectedLine);

    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Stop</th>
              <th>Order</th>
              <th>Is Station</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStops.map(item => (
              <tr key={item.id}>
                <td>
                  {editingItem.table === 'lineStops' && editingItem.id === item.id ? (
                    <select
                      value={item.stop_id}
                      onChange={(e) => handleChangeLineStop(item.id, 'stop_id', e.target.value)}
                    >
                      {transitStops.map(stop => (
                        <option key={stop.id} value={stop.id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    transitStops.find(stop => stop.id === item.stop_id)?.name
                  )}
                </td>
                <td>
                  {editingItem.table === 'lineStops' && editingItem.id === item.id ? (
                    <input
                      type="number"
                      value={item.order_of_stop}
                      onChange={(e) => handleChangeLineStop(item.id, 'order_of_stop', e.target.value)}
                    />
                  ) : (
                    item.order_of_stop
                  )}
                </td>
                <td>
                  {editingItem.table === 'lineStops' && editingItem.id === item.id ? (
                    <input
                      type="checkbox"
                      checked={item.is_station}
                      onChange={(e) => handleChangeLineStop(item.id, 'is_station', e.target.checked)}
                    />
                  ) : (
                    item.is_station ? 'Yes' : 'No'
                  )}
                </td>
                <td>
                  {editingItem.table === 'lineStops' && editingItem.id === item.id ? (
                    <button onClick={() => handleSave('lineStops')}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit('lineStops', item.id)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleAddLineStop}>Add New Stop to Line</button>
      </div>
    );
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
                        value={item[col] !== null ? item[col] : ''}
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
          {transitStops.filter(stop => stop.isComplete).map(stop => (
            <Marker key={stop.id} position={[stop.latitude!, stop.longitude!]} icon={largerIcon}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
          </div>
        </div>
        <div className="right-column">
          <h2>Transit Stops</h2>
          {renderTable('transitStops', transitStops, ['name', 'latitude', 'longitude'])}
          <h2>Line Stops</h2>
          <select value={selectedLine || ''} onChange={handleLineSelection}>
            {transitLines.map(line => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
          {renderLineStopsTable()}
        </div>
      </div>
    </div>
  );
};

export default App;