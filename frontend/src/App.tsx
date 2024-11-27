import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Map from './components/Map';
import Table from './components/Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem, TaxLot, Position, LineCostInventory } from './types/types';
import { handleChange, handleAdd, handleEdit, handleSave, createMapHandlers, handleDelete } from './utils/utils';
import './App.css';
import ResizableLayout from './components/ResizableLayout';
import { stopService, lineService, modeService } from './services';

const App: React.FC = () => {
  const position: Position = {
    x: -8210165.31, // Longitude de Montréal convertie en EPSG:3857
    y: 5702755.96   // Latitude de Montréal convertie en EPSG:3857
  };

  // États pour les données
  const [transitStops, setTransitStops] = useState<TransitStop[]>([]);
  const [transitLines, setTransitLines] = useState<TransitLine[]>([]);
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [lineStops, setLineStops] = useState<LineStop[]>([]);
  const [lineCosts, setLineCosts] = useState<LineCostInventory[]>([]);
  
  // États pour l'UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem>({ table: '', id: null });
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [newItemCreation,setNewItemCreation] = useState<boolean>(false)
 
  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Set loading True');
        const [stopsRes, linesRes, modesRes] = await Promise.all([
          stopService.getAll(),
          lineService.getAll(),
          modeService.getAll(),
          //lineService.getAllLineCosts()
        ]);
        console.log('got response')
        console.log('Transport Modes response:', modesRes);
        setTransitStops(stopsRes.data);
        setTransitLines(linesRes.data);
        setTransportModes(modesRes.data);
        //setLineCosts(costsRes.data);
        console.log('Set transport modes to:', modesRes.data);
        console.log('Set the local variables')
        if (linesRes.data.length > 0) {
          const line_id = linesRes.data[0].id
          console.log(`Line Id to retrive routepoints ${line_id}`)
          const lineStopsRes = await lineService.getAllRoutePoints();
          setLineStops(lineStopsRes.data);
          setSelectedLine(linesRes.data[0].id);
        }
        console.log('Get linestops')
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
  //useEffect(() => {
  //  const nearby = queryLotsNearLines(allLots, transitLines, transitStops, lineStops);
  //  setNearbyLots(nearby);
  //}, [allLots, transitLines, transitStops, lineStops]);

  const mapHandlers = createMapHandlers(
    transitStops,
    setTransitStops,
    lineStops,
    editingItem,
    setEditingItem,
    newItemCreation,
    setNewItemCreation
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
        lineCosts={lineCosts}
        editingItem={editingItem}
        selectedLine={selectedLine}
        newItemCreation={newItemCreation}
        position={position}
        mapHandlers={mapHandlers}
        setSelectedLine={setSelectedLine}
        setTransitLines={setTransitLines}
        setTransportModes={setTransportModes}
        setTransitStops={setTransitStops}
        setLineStops={setLineStops}
        setLineCosts={setLineCosts}
        setEditingItem={setEditingItem}
        setNewItemCreation={setNewItemCreation}
        handleDelete={commonDeleteHandler}
        //TaxLotDataLay={nearbyLots}
      />
    </div>
  );
};

export default App;