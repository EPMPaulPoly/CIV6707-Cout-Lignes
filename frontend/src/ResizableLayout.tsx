import React, { useState, useEffect, useCallback } from 'react';
import Table from './Table';
import { TransitStop, TransitLine, TransportMode, LineStop, EditingItem } from './types';
import { handleChange, handleAdd, handleEdit, handleSave } from './utils';
import { LatLngExpression } from 'leaflet';
import Map from './Map'

interface ResizableLayoutProps {
  transitLines: TransitLine[];
  transportModes: TransportMode[];
  transitStops: TransitStop[];
  lineStops: LineStop[];
  editingItem: EditingItem;
  selectedLine: number | null;
  position: LatLngExpression;
  mapHandlers: {
    handleStopAdd: (lat: number, lng: number) => void;
    handleStopMove: (stopId: number, lat: number, lng: number) => void;
    handleStopDelete: (stopId: number) => void;
    setNewStopName: (name: string) => void;
  };
  setSelectedLine: (id: number) => void;
  setTransitLines: React.Dispatch<React.SetStateAction<TransitLine[]>>;
  setTransportModes: React.Dispatch<React.SetStateAction<TransportMode[]>>;
  setTransitStops: React.Dispatch<React.SetStateAction<TransitStop[]>>;
  setLineStops: React.Dispatch<React.SetStateAction<LineStop[]>>;
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>;
  handleDelete: (table: string, id: number, setFunction: React.Dispatch<React.SetStateAction<any[]>>) => void;
  initialRightWidth?: number;
  minRightWidth?: number;
  maxRightWidth?: number;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  transitLines,
  transportModes,
  transitStops,
  lineStops,
  editingItem,
  selectedLine,
  position,
  mapHandlers,
  setSelectedLine,
  setTransitLines,
  setTransportModes,
  setTransitStops,
  setLineStops,
  setEditingItem,
  handleDelete,
  initialRightWidth = 400,
  minRightWidth = 300,
  maxRightWidth = 800,
}) => {
  const [rightWidth, setRightWidth] = useState(initialRightWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('transitLines');
  const [isSelectingStops, setIsSelectingStops] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
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

  const handleStopSelect = useCallback((stopId: number) => {
    if (!selectedLine) {
      alert('Please select a line first');
      return;
    }

    // Find the highest order in the current line
    const currentLineStops = lineStops.filter(ls => ls.line_id === selectedLine);
    const maxOrder = Math.max(...currentLineStops.map(ls => ls.order_of_stop), 0);

    // Check if stop is already in the line
    const stopExists = lineStops.some(
      ls => ls.line_id === selectedLine && ls.stop_id === stopId
    );

    if (stopExists) {
      alert('This stop is already part of the line.');
      return;
    }

    // Create new line stop
    const newLineStop: LineStop = {
      id: Math.max(...lineStops.map(ls => ls.id), 0) + 1,
      line_id: selectedLine,
      stop_id: stopId,
      order_of_stop: maxOrder + 1,
      is_station: true
    };

    setLineStops(prev => [...prev, newLineStop]);
    setIsSelectingStops(false);
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
            columns={['name', 'description', 'mode']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transitLines', id, field, value, setTransitLines)}
            handleEdit={(id) => handleEdit('transitLines', id, setEditingItem)}
            handleSave={() => handleSave('transitLines', editingItem, setTransitLines, setEditingItem)}
            handleAdd={() => handleAdd('transitLines', transitLines, setTransitLines, setEditingItem)}
            handleDelete={(id) => handleDelete('transitLines', id, setTransitLines)}
            transportModes={transportModes}
            mapHandlers={mapHandlers}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
          />
        );
      case 'transportModes':
        return (
          <Table
            table="transportModes"
            data={transportModes}
            columns={['name', 'costPerKm', 'costPerStation', 'footprint']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transportModes', id, field, value, setTransportModes)}
            handleEdit={(id) => handleEdit('transportModes', id, setEditingItem)}
            handleSave={() => handleSave('transportModes', editingItem, setTransportModes, setEditingItem)}
            handleAdd={() => handleAdd('transportModes', transportModes, setTransportModes, setEditingItem)}
            handleDelete={(id) => handleDelete('transportModes', id, setTransportModes)}
            mapHandlers={mapHandlers}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
          />
        );
      case 'transitStops':
        return (
          <Table
            table="transitStops"
            data={transitStops}
            columns={['name', 'latitude', 'longitude']}
            editingItem={editingItem}
            handleChange={(id, field, value) => handleChange('transitStops', id, field, value, setTransitStops)}
            handleEdit={(id) => handleEdit('transitStops', id, setEditingItem)}
            handleSave={() => handleSave('transitStops', editingItem, setTransitStops, setEditingItem)}
            handleAdd={() => handleAdd('transitStops', transitStops, setTransitStops, setEditingItem)}
            handleDelete={(id) => handleDelete('transitStops', id, setTransitStops)}
            mapHandlers={mapHandlers}
            isSelectingLineStops={isSelectingStops}
            setSelectingStops={setIsSelectingStops}
          />
        );
        case 'lineStops':
            return (
              <>
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
                  columns={['stop_id', 'order_of_stop', 'is_station']}
                  editingItem={editingItem}
                  handleChange={handleLineStopsChange}
                  handleEdit={(id) => handleEdit('lineStops', id, setEditingItem)}
                  handleSave={() => handleSave('lineStops', editingItem, setLineStops, setEditingItem)}
                  handleAdd={() => handleAdd('lineStops', lineStops, setLineStops, setEditingItem, { line_id: selectedLine }, setIsSelectingStops)}
                  handleDelete={(id) => handleDelete('lineStops', id, setLineStops)}
                  transitStops={transitStops}
                  isSelectingLineStops = {isSelectingStops}
                  setSelectingStops={setIsSelectingStops}
                />
              </>
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
          transitLines={transitLines}
          onStopAdd={mapHandlers.handleStopAdd}
          onStopMove={mapHandlers.handleStopMove}
          onStopDelete={mapHandlers.handleStopDelete}
          isAddingNewStop={editingItem.table === 'transitStops' && editingItem.id === null}
          editingItem={editingItem}
          selectedLine={selectedLine}
          onStopSelect={handleStopSelect}
          isSelectingStops={isSelectingStops}
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
          {isCollapsed ? '→' : '←'}
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