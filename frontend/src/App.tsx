import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { LatLngExpression } from 'leaflet';
import Map from './Map';
import Table from './Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem, TaxLot } from './types';
import { handleChange, handleAdd, handleEdit, handleSave, createMapHandlers, handleDelete } from './utils';
import './App.css';
import ResizableLayout from './ResizableLayout';
import { generateFullGrid, queryLotsNearLines } from './generateTaxLots';
import { stopService, lineService, modeService } from './services';

const App: React.FC = () => {
  const position: LatLngExpression = [45.549152, -73.61368]; // Montreal coordinates

  // États pour les données
  const [transitStops, setTransitStops] = useState<TransitStop[]>([]);
  const [transitLines, setTransitLines] = useState<TransitLine[]>([]);
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [lineStops, setLineStops] = useState<LineStop[]>([]);
  
  // États pour l'UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem>({ table: '', id: null });
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  // TaxLots states
  const [allLots] = useState(() => generateFullGrid());
  const [nearbyLots, setNearbyLots] = useState<TaxLot[]>([]);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [stopsRes, linesRes, modesRes] = await Promise.all([
          stopService.getAll(),
          lineService.getAll(),
          modeService.getAll()
        ]);

        setTransitStops(stopsRes.data);
        setTransitLines(linesRes.data);
        setTransportModes(modesRes.data);

        if (linesRes.data.length > 0) {
          const lineStopsRes = await lineService.getRoutePoints(linesRes.data[0].id);
          setLineStops(lineStopsRes.data);
          setSelectedLine(linesRes.data[0].id);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mise à jour des TaxLots quand les lignes/arrêts changent
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

  const handleLineStopsSave = async (updatedLineStops: LineStop[]) => {
    try {
      if (selectedLine) {
        await lineService.updateRoutePoints(selectedLine, updatedLineStops);
        setLineStops(updatedLineStops);
      }
      setEditingItem({ table: '', id: null });
    } catch (error) {
      console.error('Error saving line stops:', error);
    }
  };

  const handleLineStopsChange = (id: number, field: string, value: string | number | boolean) => {
    setLineStops(prevStops => 
      prevStops.map(stop => 
        stop.id === id ? { ...stop, [field]: field === 'stop_id' ? parseInt(value as string) : value } : stop
      )
    );
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

  if (loading) {
    return <div>Chargement de l'application...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

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