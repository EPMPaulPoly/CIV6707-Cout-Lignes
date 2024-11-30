import React, { useState, useEffect, useCallback } from 'react';
import Table from '../components/Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem, TaxLot, InsertPosition, Position,LineCostInventory } from '../types/types';
import { handleChange, handleAdd, handleEdit, handleCancel, handleSave, calculateNewOrder } from '../utils/utils';
import Map from '../components/Map'
import { lineService } from '../services';
import { leafletToPosition, positionToLeaflet } from '../utils/coordinates';
import StaticTable from './StaticTable';

const COLUMN_MAPPINGS = {
  transitLines: [
    { field: 'name', header: 'Name' },
    { field: 'description', header: 'Description' },
    { field: 'mode', header: 'Transport mode' },
    { field: 'color', header: 'Color' }
  ],
  transportModes: [
    { field: 'name', header: 'Name' },
    { field: 'costPerKm', header: 'Cost per Km' },
    { field: 'costPerStation', header: 'Cost per station' },
    { field: 'footprint', header: 'Footprint' }
  ],
  transitStops: [
    { field: 'name', header: 'Name' },
    { field: 'latitude', header: 'Latitude' },
    { field: 'longitude', header: 'Longitude' },
    { field: 'isStation', header: 'Is a Station' }
  ],
  lineStops: [
    { field: 'order_of_stop', header: 'Order' },
    { field: 'stop_id', header: 'Stop ID' },
    { field: 'stop_name', header: 'Stop name' }
  ],
  lineCosts: [
    {field:'id',header:'Line Name'},
    {field: 'parcelsWithinBuffer',header: 'N lots'},
    {field: 'totalPropertyValue',header: 'Property Value'},
    {field: 'lineLength',header:'Length'},
    {field: 'linearInfraCost',header:'Track M$'},
    {field: 'nStations',header:'N stat'},
    {field: 'stationCost',header:'Stat M$'}
  ]
};

interface ResizableLayoutProps {
  transitLines: TransitLine[];
  transportModes: TransportMode[];
  transitStops: TransitStop[];
  lineStops: LineStop[];
  lineCosts: LineCostInventory[];
  cadastreLots: GeoJSON.FeatureCollection | null;
  editingItem: EditingItem;
  newItemCreation: boolean;
  selectedLine: number | null;
  position: Position;
  mapHandlers: {
    handleStopAdd: (poition: Position) => void;
    handleStopMove: (stopId: number, position: Position) => void;
    handleStopDelete: (stopId: number) => void;
    handleStopEdit: (stopId: number) => void;
    setNewStopName: (name: string) => void;
  };
  setSelectedLine: (id: number) => void;
  setTransitLines: React.Dispatch<React.SetStateAction<TransitLine[]>>;
  setTransportModes: React.Dispatch<React.SetStateAction<TransportMode[]>>;
  setTransitStops: React.Dispatch<React.SetStateAction<TransitStop[]>>;
  setLineStops: React.Dispatch<React.SetStateAction<LineStop[]>>;
  setLineCosts:React.Dispatch<React.SetStateAction<LineCostInventory[]>>;
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>;
  setNewItemCreation: React.Dispatch<React.SetStateAction<boolean>>;
  setCadastreLots:React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection | null>>;
  handleDelete: (table: string, id: number, setFunction: React.Dispatch<React.SetStateAction<any[]>>) => void;
  initialRightWidth?: number;
  minRightWidth?: number;
  maxRightWidth?: number;
  TaxLotDataLay?: TaxLot[];
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  transitLines,
  transportModes,
  transitStops,
  lineStops,
  lineCosts,
  cadastreLots,
  editingItem,
  selectedLine,
  newItemCreation,
  position,
  mapHandlers,
  setSelectedLine,
  setTransitLines,
  setTransportModes,
  setTransitStops,
  setLineStops,
  setLineCosts,
  setEditingItem,
  setNewItemCreation,
  setCadastreLots,
  handleDelete,
  initialRightWidth = 400,
  minRightWidth = 300,
  maxRightWidth = 800,
  TaxLotDataLay
}) => {
  const [rightWidth, setRightWidth] = useState(initialRightWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('transitLines');
  const [isSelectingStops, setIsSelectingStops] = useState(false);
  const [originalItem, setOriginalItem] = useState<any>(null);
  const [originalPosition, setOriginalPosition] = useState<Position | null>(null);



  const [insertPosition, setInsertPosition] = useState<InsertPosition>({ type: 'last' });
  const handleInsertPositionChange = useCallback((newPosition: InsertPosition) => {
    setInsertPosition(newPosition);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleStopSave = (stopId: number) => {
    handleSave('transitStops', editingItem, setTransitStops, setEditingItem, newItemCreation, setNewItemCreation, transitStops);
  };

  const handleStopCancel = (stopId: number) => {
    if (originalPosition) {
      const updatedStops = transitStops.map(stop => 
        stop.id === stopId 
          ? { ...stop, position: originalPosition }
          : stop
      );
      setTransitStops(updatedStops);
    }
    handleCancel(editingItem, setEditingItem, originalItem, setOriginalItem, setTransitStops, setNewItemCreation);
    setOriginalPosition(null);
  };

  const handleStopEditWithPosition = (stopId: number) => {
    const stop = transitStops.find(s => s.id === stopId);
    if (stop && stop.position) {
      setOriginalPosition(stop.position);
    }
    mapHandlers.handleStopEdit(stopId);
  };

  const handleStopMove = (stopId: number, newPosition: Position) => {
    const updatedStops = transitStops.map(stop =>
      stop.id === stopId
        ? { ...stop, position: newPosition }
        : stop
    );
    setTransitStops(updatedStops);
  };

  const togglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const containerRect = document.querySelector('.resizable-layout')?.getBoundingClientRect();
    if (!containerRect) return;

    const newWidth = Math.max(
      minRightWidth,
      Math.min(
        maxRightWidth,
        containerRect.right - e.clientX
      )
    );

    setRightWidth(newWidth);
  }, [isResizing, minRightWidth, maxRightWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleStopSelect = useCallback(async (stopId: number, insertPositionfunc: InsertPosition) => {
    console.log('handleStopSelect called with:', { stopId, insertPositionfunc });
    if (!selectedLine) {
      alert('Please select a line first');
      return;
    }

    const stopExists = lineStops.some(
      ls => ls.line_id === selectedLine && ls.stop_id === stopId
    );

    if (stopExists) {
      alert('This stop is already part of the line.');
      return;
    }

    // Add the stop with the next available order
    const currentLineStops = lineStops.filter(ls => ls.line_id === selectedLine);


    const newOrder = calculateNewOrder(currentLineStops, insertPositionfunc);

    try {
      // 1. Add the new point
      await lineService.addRoutePoint(selectedLine, {
        line_id: selectedLine,
        stop_id: stopId,
        order_of_stop: newOrder
      });

      if (insertPositionfunc.type !== 'last') {
        // 2. Update orders of existing points that come after
        const updatedStops = currentLineStops
          .filter(ls => ls.order_of_stop >= newOrder)
          .map(ls => ({
            ...ls,
            order_of_stop: ls.order_of_stop + 1
          }));

        await lineService.updateRoutePoints(selectedLine, updatedStops);
      }
      // 3. Query to get clean state
      const freshData = await lineService.getAllRoutePoints();
      if (freshData.data) {
        setLineStops(freshData.data);

      }
    } catch (error) {
      console.error('Failed to update line stops:', error);
    } finally {
      setIsSelectingStops(false);
    }
  }, [selectedLine, lineStops, setLineStops]);

  const handleLineStopsChange = (id: number, field: string, value: string | number | boolean) => {
    setLineStops(prevStops =>
      prevStops.map(stop =>
        stop.id === id ? { ...stop, [field]: field === 'stop_id' ? parseInt(value as string) : value } : stop
      )
    );
  };

  const renderActiveTable = () => {
    switch (activeTable) {
      case 'transitLines':
        return (
          <Table
            table="transitLines"
            data={transitLines}
            columns={COLUMN_MAPPINGS.transitLines}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transitLines', id, field, value, setTransitLines, transportModes)}
            handleEdit={(id) => handleEdit('transitLines', id, setEditingItem, transitLines, setOriginalItem)}
            handleCancel={() => handleCancel(editingItem, setEditingItem, originalItem, setOriginalItem, setTransitLines, setNewItemCreation)}
            handleSave={() => handleSave('transitLines', editingItem, setTransitLines, setEditingItem, newItemCreation, setNewItemCreation, transitLines)}
            handleAdd={() => handleAdd('transitLines', transitLines, setTransitLines, setEditingItem, newItemCreation, setNewItemCreation)}
            handleDelete={(id) => handleDelete('transitLines', id, setTransitLines)}
            transportModes={transportModes}
            mapHandlers={mapHandlers}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
            newItemCreation={newItemCreation}
            setNewItemCreation={setNewItemCreation}
          />
        );
      case 'transportModes':
        return (
          <Table
            table="transportModes"
            data={transportModes}
            columns={COLUMN_MAPPINGS.transportModes}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transportModes', id, field, value, setTransportModes)}
            handleEdit={(id) => handleEdit('transportModes', id, setEditingItem, transportModes, setOriginalItem)}
            handleCancel={() => handleCancel(editingItem, setEditingItem, originalItem, setOriginalItem, setTransitLines, setNewItemCreation)}
            handleSave={() => handleSave('transportModes', editingItem, setTransportModes, setEditingItem, newItemCreation, setNewItemCreation, transportModes)}
            handleAdd={() => handleAdd('transportModes', transportModes, setTransportModes, setEditingItem, newItemCreation, setNewItemCreation)}
            handleDelete={(id) => handleDelete('transportModes', id, setTransportModes)}
            mapHandlers={mapHandlers}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
            newItemCreation={newItemCreation}
            setNewItemCreation={setNewItemCreation}
          />
        );
      case 'transitStops':
        return (
          <Table
            table="transitStops"
            data={transitStops}
            columns={COLUMN_MAPPINGS.transitStops}
            editingItem={editingItem}
            newItemCreation={newItemCreation}
            handleChange={(id, field, value) => handleChange('transitStops', id, field, value, setTransitStops)}
            handleEdit={(id) => handleEdit('transitStops', id, setEditingItem, transitStops, setOriginalItem)}
            handleCancel={() => handleCancel(editingItem, setEditingItem, originalItem, setOriginalItem, setTransitStops, setNewItemCreation)}
            handleSave={() => handleSave('transitStops', editingItem, setTransitStops, setEditingItem, newItemCreation, setNewItemCreation, transitStops)}
            handleAdd={() => handleAdd('transitStops', transitStops, setTransitStops, setEditingItem, newItemCreation, setNewItemCreation)}
            handleDelete={(id) => handleDelete('transitStops', id, setTransitStops)}
            mapHandlers={mapHandlers}
            setNewItemCreation={setNewItemCreation}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
          />
        );
      case 'lineStops':
        return (
          <div>
            <select
              value={selectedLine || ''}
              onChange={(e) => setSelectedLine(Number(e.target.value))}
              className="mb-4"
            >
              {transitLines.map(line => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
            <Table
              table="lineStops"
              data={lineStops.filter(stop => stop.line_id === selectedLine)}
              columns={COLUMN_MAPPINGS.lineStops}
              editingItem={editingItem}
              newItemCreation={newItemCreation}
              handleChange={handleLineStopsChange}
              handleEdit={(id) => handleEdit('lineStops', id, setEditingItem, lineStops, setOriginalItem)}
              handleCancel={() => handleCancel(editingItem, setEditingItem, originalItem, setOriginalItem, setLineStops, setNewItemCreation)}
              handleSave={() => handleSave('lineStops', editingItem, setLineStops, setEditingItem, newItemCreation, setNewItemCreation, lineStops)}
              handleAdd={() => handleAdd('lineStops', lineStops, setLineStops, setEditingItem, newItemCreation, setNewItemCreation, { line_id: selectedLine }, setIsSelectingStops)}
              handleDelete={(id) => handleDelete('lineStops', id, setLineStops)}
              transitStops={transitStops}
              isSelectingLineStops={isSelectingStops}
              setSelectingStops={setIsSelectingStops}
              onInsertPositionChange={handleInsertPositionChange}
              setNewItemCreation={setNewItemCreation}
            />
          </div>
        );
      case 'lineCosts':
        return (
          <StaticTable
            table="lineCosts"
            data={lineCosts}
            columns={COLUMN_MAPPINGS.lineCosts}
            transitLines={transitLines}
            setLineCosts={setLineCosts}
            setCadastreLots={setCadastreLots}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="resizable-layout">
      <div className="resizable-left">
        <Map
          transitStops={transitStops}
          position={position}
          lineStops={lineStops}
          cadastreLots={cadastreLots}
          transportModes={transportModes}
          transitLines={transitLines}
          onStopAdd={mapHandlers.handleStopAdd}
          onStopMove={mapHandlers.handleStopMove}
          onStopDelete={mapHandlers.handleStopDelete}
          onStopEdit={handleStopEditWithPosition}
          onStopSave={handleStopSave}
          onStopCancel={handleStopCancel}
          isAddingNewStop={editingItem.table === 'transitStops' && editingItem.id === null}
          editingItem={editingItem}
          selectedLine={selectedLine}
          onStopSelect={handleStopSelect}
          isSelectingStops={isSelectingStops}
          TaxLotData={TaxLotDataLay}
          insertPosition={insertPosition}
        />
      </div>
      <div
        className={`resize-handle ${isResizing ? 'active' : ''}`}
        onMouseDown={handleMouseDown}
        style={{ right: isCollapsed ? '0' : `${rightWidth}px` }}
      >
        <button
          className="toggle-button"
          onClick={togglePanel}
          title={isCollapsed ? "Show Panel" : "Hide Panel"}
        >
          {isCollapsed ? '←' : '→'}
        </button>
      </div>
      <div
        className={`resizable-right ${isCollapsed ? 'collapsed' : ''}`}
        style={{ width: `${rightWidth}px` }}
      >
        <div className="tables-container">
          <div className="table-tabs">
            <button
              className={activeTable === 'transitLines' ? 'active' : ''}
              onClick={() => setActiveTable('transitLines')}
            >
              Transit Lines
            </button>
            <button
              className={activeTable === 'transportModes' ? 'active' : ''}
              onClick={() => setActiveTable('transportModes')}
            >
              Transport Modes
            </button>
            <button
              className={activeTable === 'transitStops' ? 'active' : ''}
              onClick={() => setActiveTable('transitStops')}
            >
              Transit Stops
            </button>
            <button
              className={activeTable === 'lineStops' ? 'active' : ''}
              onClick={() => setActiveTable('lineStops')}
            >
              Line Stops
            </button>
            <button
              className={activeTable === 'lineCosts' ? 'active' : ''}
              onClick={() => setActiveTable('lineCosts')}
            >
              Line Costs
            </button>
          </div>
          <div className="active-table">
            {renderActiveTable()}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResizableLayout;