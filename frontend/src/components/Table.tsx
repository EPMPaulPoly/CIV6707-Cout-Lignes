import React, { useState } from 'react';
import { EditingItem, TransportMode, TransitStop,InsertPosition } from '../types/types';
import {MapHandlers} from '../utils/utils';

interface TableProps {
  table: string;
  data: any[];
  columns: string[];
  editingItem: EditingItem;
  handleChange: (id: number, field: string, value: string | number | boolean) => void;
  handleEdit: (id: number) => void;
  handleSave: () => void;
  handleAdd: (insertPosition?: { type: 'first' | 'last' | 'after', afterStopId?: number }) => void;  // Updated this line
  handleDelete:(id:number) =>void;
  transportModes?: TransportMode[];
  transitStops?: TransitStop[];
  mapHandlers?: MapHandlers; 
  isSelectingLineStops: boolean,
  setSelectingStops: (state:boolean)=>void;
  onStopAdd?: (stopId: number, position: InsertPosition) => void;
  onInsertPositionChange?: (position: InsertPosition) => void;
}

const Table: React.FC<TableProps> = ({ 
  table, 
  data, 
  columns, 
  editingItem, 
  handleChange, 
  handleEdit, 
  handleSave, 
  handleAdd,
  handleDelete,
  transportModes,
  transitStops,
  mapHandlers,
  isSelectingLineStops,
  setSelectingStops,
  onInsertPositionChange
}) => {
  // For transit stops, only show editable name field
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Safely access mapHandlers
    mapHandlers?.setNewStopName(value);
    handleChange(0, 'name', value);
  };
  // format the lat long for 4 get
  const formatValue = (value: any, column: string) => {
    if (table === 'transitStops' && ['latitude', 'longitude'].includes(column)) {
      return value !== null ? value.toFixed(4) : '';
    } else if (column === 'isStation' && value){
      return 'Yes'
    } else if (column === 'isStation' && !value){
      return 'No'
    }
    return value;
  };

  const getModeNameById = (modeId: number): string => {
    const mode = transportModes?.find(m => m.id === modeId);
    return mode ? mode.name : 'Unknown Mode';
  };
  // Helper to determine if a field should be editable
  const isEditable = (column: string) => {
    if (table === 'transitStops') {
      return column === 'name';
    }
    return true;
  };

  React.useEffect(() => {
    console.log('Table state:', {
      table,
      editingItem,
      isTransitStops: table === 'transitStops',
      isEditing: editingItem.table === 'transitStops',
      editingId: editingItem.id
    });
  }, [table, editingItem]);

  // Add state for insert position
  interface InsertPosition {
    type: 'first' | 'last' | 'after';
    afterStopId?: number;
  }

  const [insertPosition, setInsertPosition] = useState<InsertPosition>({ type: 'last' });

  const calculateNewOrder = (position: InsertPosition) => {
    const currentLineStops = data;
    
    switch (position.type) {
      case 'first':
        return Math.min(...currentLineStops.map(ls => ls.order_of_stop), 1) - 1;
        
      case 'after':
        if (position.afterStopId) {
          const afterStop = currentLineStops.find(ls => ls.id === position.afterStopId);
          if (afterStop) {
            return afterStop.order_of_stop + 1;
          }
        }
        return currentLineStops.length + 1;
        
      case 'last':
      default:
        return Math.max(...currentLineStops.map(ls => ls.order_of_stop), 0) + 1;
    }
  };

  const handleAddWithPosition = () => {
    const additionalProps = {
      order_of_stop: calculateNewOrder(insertPosition)
    };
    handleAdd(insertPosition);
  };

  const renderStopControls = () => {
    switch (table){
      case 'transitStops':
        if (editingItem.table === 'transitStops') {
          if (editingItem.id === null) {
            return (
              <input
                type="text"
                placeholder="Enter stop name and click on map to place"
                onChange={handleNameChange}
                className="stop-name-input"
              />
            );
          } else {
            return (
              <div className="edit-instruction">
                Drag point to modify position
              </div>
            );}
        } else {
          return (
            <button 
              onClick={(e: React.MouseEvent) => handleAdd()}
              className="stop-add-button"
            >
              Add
            </button>);}
    case 'lineStops':
      if (isSelectingLineStops === false) {
        return (
          <button 
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleAdd(insertPosition);
            }}
            className="standard-add-button"
          >
            Add New
          </button>
        );
      } else {
        return (
          <div className="flex gap-2 items-center">
            <select 
              className="p-2 border rounded"
              value={`${insertPosition.type}${insertPosition.afterStopId ? '-' + insertPosition.afterStopId : ''}`}
              onChange={(e) => {
                const [type, stopId] = e.target.value.split('-');
                const newPosition = { 
                  type: type as 'first' | 'last' | 'after',
                  afterStopId: stopId ? parseInt(stopId) : undefined 
                };
                console.log('Selected position:', newPosition);
                setInsertPosition(newPosition);
                onInsertPositionChange?.(newPosition);
              }}
            >
              <option value="last">Add to End</option>
              <option value="first">Add to Start</option>
              {data.map(stop => (
                <option key={stop.id} value={`after-${stop.id}`}>
                  After {transitStops?.find(ts => ts.id === stop.stop_id)?.name || `Stop #${stop.stop_id}`}
                </option>
              ))}
            </select>
            <button 
              onClick={() => setSelectingStops(false)}
              className="standard-add-button"
            >
              Cancel
            </button>
          </div>
        );
      }
      default:
        return(
        <button 
            onClick={(e: React.MouseEvent) => handleAdd()}
            className="standard-add-button"
          >
            Add New
          </button>);
  };
};

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Act</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {columns.map(col => (
                <td key={col}>
                  {editingItem.table === table && editingItem.id === item.id && isEditable(col)? (
                    col === 'mode' && table === 'transitLines' ? (
                      <select
                        value={getModeNameById(item[col])}
                        onChange={(e) => handleChange(item.id, col, e.target.value)}
                      >
                        {transportModes?.map(mode => (
                          <option key={mode.id} value={mode.name}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    ) : col === 'stop_id' && table === 'lineStops' ? (
                      <select
                        value={item[col]}
                        onChange={(e) => handleChange(item.id, col, e.target.value)}
                      >
                        {transitStops?.map(stop => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </select>
                    ) : col === 'is_station' ? (
                      <input
                        type="checkbox"
                        checked={item[col]}
                        onChange={(e) => handleChange(item.id, col, e.target.checked)}
                      />
                    ) : (
                      <input
                        type={typeof item[col] === 'number' ? 'number' : 'text'}
                        value={item[col] !== null ? item[col] : ''}
                        onChange={(e) => handleChange(item.id, col, e.target.value)}
                      />
                    )
                  ) : (
                    col === 'stop_name' && table === 'lineStops' ? (
                      transitStops?.find(stop => stop.id === item[col])?.name 
                    ) : col === 'mode' && table === 'transitLines' ?(
                      getModeNameById(item.mode_id)
                    ) : col === 'latitude' && table === 'transitStops' ?(
                      formatValue(item.position.lat, col)
                    ) : col === 'longitude' && table === 'transitStops' ?(
                      formatValue(item.position.lng, col)
                    ) :  col === 'isStation' && table === 'transitStops' ?(
                      formatValue(item[col], col)
                    ) :(
                      formatValue(item[col], col)
                    )
                  )}
                </td>
              ))}
              <td>
                {editingItem.table === table && editingItem.id === item.id ? (
                  <button onClick={handleSave}>Save</button>
                ) : (
                  <button onClick={() => handleEdit(item.id)}>Edit</button>
                )}
              </td>
              <td>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {<div className="table-controls">
        {renderStopControls()}
      </div>}
    </div>
  );
};

export default Table;