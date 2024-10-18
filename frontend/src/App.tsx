import React, { useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import Map from './Map';
import Table from './Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem } from './types';
import { handleChange, handleAdd, handleEdit, handleSave } from './utils';
import './App.css';

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152, -73.61368]; // Montreal coordinates

  const [transitStops, setTransitStops] = useState<TransitStop[]>([
    { id: 1, name: 'Montreal Central', latitude: 45.549152, longitude: -73.61368, isComplete: true },
    { id: 2, name: 'EO 1', latitude: 45.53, longitude: -73.63, isComplete: true },
    { id: 3, name: 'EO 2', latitude: 45.57, longitude: -73.6, isComplete: true },
    { id: 4, name: 'NS 1', latitude: 45.56, longitude: -73.64, isComplete: true },
    { id: 5, name: 'NS 1', latitude: 45.54, longitude: -73.59, isComplete: true },
    { id: 6, name: 'Random', latitude: 45.56, longitude: -73.57, isComplete: true }
  ]);

  const [transitLines, setTransitLines] = useState<TransitLine[]>([
    { id: 1, name: 'Green Line', description: 'East-West Line', mode: 'Metro' },
    { id: 2, name: 'Yellow Line', description: 'NS Line', mode: 'Tram' },
  ]);

  const [transportModes, setTransportModes] = useState<TransportMode[]>([
    { id: 1, name: 'Metro', costPerKm: 1000, costPerStation: 0.2, footprint: 50 },
    { id: 2, name: 'Tram', costPerKm: 70, costPerStation: 0.07, footprint: 20 },
  ]);


  const [lineStops, setLineStops] = useState<LineStop[]>([
    { id: 1, line_id: 1, stop_id: 2, order_of_stop: 1, is_station: true },
    { id: 2, line_id: 1, stop_id: 1, order_of_stop: 2, is_station: true },
    { id: 3, line_id: 1, stop_id: 3, order_of_stop: 3, is_station: true },
    { id: 4, line_id: 2, stop_id: 4, order_of_stop: 1, is_station: true },
    { id: 5, line_id: 2, stop_id: 1, order_of_stop: 2, is_station: true },
    { id: 6, line_id: 2, stop_id: 5, order_of_stop: 3, is_station: true },
    { id: 7, line_id: 1, stop_id: 6, order_of_stop: 4, is_station: true },
  ]);

  const [editingItem, setEditingItem] = useState<EditingItem>({ table: '', id: null });

  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  useEffect(() => {
    if (transitLines.length > 0 && selectedLine === null) {
      setSelectedLine(transitLines[0].id);
    }
  }, [transitLines, selectedLine]);



  const handleLineStopsSave = (updatedLineStops: LineStop[]) => {
    
    setLineStops(updatedLineStops);
    setEditingItem({ table: '', id: null });
    
  };

  const handleLineStopsChange = (id: number, field: string, value: string | number | boolean) => {
    
    const updatedLineStops = lineStops.map(stop => 
      stop.id === id ? { ...stop, [field]: field === 'stop_id' ? parseInt(value as string) : value } : stop
    );
    setLineStops(updatedLineStops);
  };
  
  const handleSaveWrapper = (table: string) => (tempValues: {[key: string]: any}) => {
    handleSave(
      table, 
      editingItem, 
      table === 'transitStops' ? setTransitStops :
      table === 'transitLines' ? setTransitLines :
      table === 'transportModes' ? setTransportModes :
      setLineStops, 
      setEditingItem,
      tempValues
    );
    if (table === 'transitStops') {
      setTransitStops(prev => [...prev]);
    } else if (table === 'transitLines') {
      setTransitLines(prev => [...prev]);
    } else if (table === 'transportModes') {
      setTransportModes(prev => [...prev]);
    } else if (table === 'lineStops') {
      setLineStops(prev => [...prev]);
    }
  };

  return (
    <div className="app">
      <h1>Transit Planning Application</h1>
      <div className="content-wrapper">
        <div className="left-column">
          <h2>Transit Lines</h2>
          <Table
            table="transitLines"
            data={transitLines}
            columns={['name', 'description', 'mode']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transitLines', id, field, value, setTransitLines)}
            handleEdit={(id) => handleEdit('transitLines', id, setEditingItem)}
            handleSave={handleSaveWrapper('transitLines')}
            handleAdd={() => handleAdd('transitLines', transitLines, setTransitLines, setEditingItem)}
            transportModes={transportModes}
          />
          <h2>Transport Modes</h2>
          <Table
            table="transportModes"
            data={transportModes}
            columns={['name', 'costPerKm', 'costPerStation', 'footprint']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transportModes', id, field, value, setTransportModes)}
            handleEdit={(id) => handleEdit('transportModes', id, setEditingItem)}
            handleSave={handleSaveWrapper('transportModes')}
            handleAdd={() => handleAdd('transportModes', transportModes, setTransportModes, setEditingItem)}
          />
        </div>
        <div className="center-column">
          <Map 
            transitStops={transitStops} 
            position={position}
            lineStops={lineStops}
            transitLines={transitLines}
          />
        </div>
        <div className="right-column">
          <h2>Transit Stops</h2>
          <Table
            table="transitStops"
            data={transitStops}
            columns={['name', 'latitude', 'longitude']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transitStops', id, field, value, setTransitStops)}
            handleEdit={(id) => handleEdit('transitStops', id, setEditingItem)}
            handleSave={handleSaveWrapper('transitStops')}
            handleAdd={() => handleAdd('transitStops', transitStops, setTransitStops, setEditingItem)}
          />
          <h2>Line Stops</h2>
          <select value={selectedLine || ''} onChange={(e) => setSelectedLine(Number(e.target.value))}>
            {transitLines.map(line => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
          <Table
            table="lineStops"
            data={lineStops.filter(stop => stop.line_id === selectedLine)}
            columns={['stop_id', 'order_of_stop', 'is_station']}
            editingItem={editingItem}
            handleChange={handleLineStopsChange}
            handleEdit={(id) => handleEdit('lineStops', id, setEditingItem)}
            handleSave={handleSaveWrapper('lineStops')}
            handleAdd={() => handleAdd('lineStops', lineStops, setLineStops, setEditingItem, { line_id: selectedLine })}
            transitStops={transitStops}
          />
        </div>
      </div>
    </div>
  );
};



export default App;