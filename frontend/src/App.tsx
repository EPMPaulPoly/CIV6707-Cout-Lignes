import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { LatLngExpression } from 'leaflet';
import Map from './Map';
import Table from './Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem,TaxLot } from './types';
import { handleChange, handleAdd, handleEdit, handleSave, createMapHandlers, handleDelete } from './utils';
import './App.css';
import ResizableLayout from './ResizableLayout';
import { generateFullGrid, queryLotsNearLines } from './generateTaxLots';

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152, -73.61368]; // Montreal coordinates

  const [transitStops, setTransitStops] = useState<TransitStop[]>([
    { id: 1, name: 'Montreal Central', latitude: 45.549152, longitude: -73.61368, isComplete: true },
    { id: 2, name: 'EO 1', latitude: 45.53, longitude: -73.63, isComplete: true },
    { id: 3, name: 'EO 2', latitude: 45.57, longitude: -73.6, isComplete: true },
    { id: 4, name: 'NS 1', latitude: 45.56, longitude: -73.64, isComplete: true },
    { id: 5, name: 'NS 2', latitude: 45.54, longitude: -73.59, isComplete: true },
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

  
  // In your App component, initialize taxLots with the generated data:
 
  // Generate all lots once
  const [allLots] = useState(() => generateFullGrid());
  
  // Query and update nearby lots whenever lines/stops change
  const [nearbyLots, setNearbyLots] = useState<TaxLot[]>([]);

  const [editingItem, setEditingItem] = useState<EditingItem>({ table: '', id: null });

  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const [activeTable, setActiveTable] = useState<string>('transitLines');

  useEffect(() => {
    const nearby = queryLotsNearLines(allLots, transitLines, transitStops, lineStops);
    setNearbyLots(nearby);
  }, [allLots, transitLines, transitStops, lineStops]);

  const mapHandlers = createMapHandlers(
    transitStops,
    setTransitStops,
    lineStops,
    editingItem,
    setEditingItem
  );

  useEffect(() => {
    if (transitLines.length > 0 && selectedLine === null) {
      setSelectedLine(transitLines[0].id);
    }
  }, [transitLines, selectedLine]);



  const handleLineStopsSave = (updatedLineStops: LineStop[]) => {
    
    setLineStops(updatedLineStops);
    setEditingItem({ table: '', id: null });
    
  };
  const commonDeleteHandler = (table: string, id: number, setFunction: Dispatch<SetStateAction<any[]>>) => {
    handleDelete({
      table,
      id,
      setFunction,
      lineStops,
      transitStops,
      transitLines,
      transportModes,
      editingItem,
      setEditingItem
    });
  };

  const handleLineStopsChange = (id: number, field: string, value: string | number | boolean) => {
    
    const updatedLineStops = lineStops.map(stop => 
      stop.id === id ? { ...stop, [field]: field === 'stop_id' ? parseInt(value as string) : value } : stop
    );
    setLineStops(updatedLineStops);
  };

    return (
    <div className="app">
      <h1>Transit Planning Application</h1>
      <ResizableLayout
        transitLines={transitLines}
        transportModes={transportModes}
        transitStops={transitStops}
        lineStops={lineStops}
        editingItem={editingItem}
        selectedLine={selectedLine}
        position={position}
        mapHandlers={mapHandlers}
        setSelectedLine={setSelectedLine}
        setTransitLines={setTransitLines}
        setTransportModes={setTransportModes}
        setTransitStops={setTransitStops}
        setLineStops={setLineStops}
        setEditingItem={setEditingItem}
        handleDelete={commonDeleteHandler}
        TaxLotDataLay={nearbyLots}
      />
    </div>
  );
};

export default App;