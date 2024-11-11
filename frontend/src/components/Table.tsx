import React, { useState } from 'react';
import { EditingItem, TransportMode, TransitStop, InsertPosition } from '../types/types';
import { MapHandlers, getContrastColor } from '../utils/utils';

interface ColumnMapping {
  field: string;
  header: string;
}

interface TableProps {
  table: string;
  data: any[];
  columns: ColumnMapping[];
  editingItem: EditingItem;
  newItemCreation: boolean;
  handleChange: (id: number, field: string, value: string | number | boolean, transport_modes?: TransportMode[]) => void;
  handleEdit: (id: number) => void;
  handleSave: () => void;
  handleCancel: () => void; // Ajout du handleCancel
  handleAdd: (insertPosition?: { type: 'first' | 'last' | 'after', afterStopId?: number }) => void;  // Updated this line
  handleDelete: (id: number) => void;
  transportModes?: TransportMode[];
  transitStops?: TransitStop[];
  mapHandlers?: MapHandlers;
  isSelectingLineStops: boolean,
  setSelectingStops: (state: boolean) => void;
  setNewItemCreation: (state: boolean) => void;
  onStopAdd?: (stopId: number, position: InsertPosition) => void;
  onInsertPositionChange?: (position: InsertPosition) => void;
}

const TRANSIT_COLORS = [
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FFA500', label: 'Orange' },
  { value: '#800080', label: 'Purple' },
  { value: '#FFC0CB', label: 'Pink' },
  { value: '#A52A2A', label: 'Brown' },
  { value: '#808080', label: 'Gray' },
  { value: '#000000', label: 'Black' }
];

const Table: React.FC<TableProps> = ({
  table,
  data,
  columns,
  editingItem,
  handleChange,
  handleEdit,
  handleSave,
  handleCancel, // Ajout du handleCancel dans les props
  handleAdd,
  handleDelete,
  transportModes,
  transitStops,
  mapHandlers,
  isSelectingLineStops,
  setSelectingStops,
  onInsertPositionChange
}) => {
  // Filter out latitude and longitude columns for transit stops table
  const visibleColumns = table === 'transitStops' 
    ? columns.filter(col => !['latitude', 'longitude'].includes(col.field))
    : columns;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    mapHandlers?.setNewStopName(value);
    handleChange(0, 'name', value);
  };

  const formatValue = (value: any, field: string) => {
    if (table === 'transitStops' && ['latitude', 'longitude'].includes(field)) {
      return value !== null ? value.toFixed(4) : '';
    } else if (field === 'isStation' && value) {
      return 'Yes'
    } else if (field === 'isStation' && !value) {
      return 'No'
    }
    return value;
  };

  const getModeNameById = (modeId: number): string => {
    const mode = transportModes?.find(m => m.id === modeId);
    return mode ? mode.name : 'Unknown Mode';
  };

  const getStopNameById = (stopId: number): string => {
    const stop = transitStops?.find(m => m.id === stopId);
    return stop ? stop.name : 'Unknown Stop';
  }

  const isEditable = (field: string) => {
    if (table === 'transitStops' && field === 'latitude') {
      return false;
    } else if (table === 'transitStops' && field === 'longitude') {
      return false;
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
    switch (table) {
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
            );
          }
        } else {
          return (
            <button
              onClick={(e: React.MouseEvent) => handleAdd()}
              className="stop-add-button"
            >
              Add
            </button>);
        }
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
        return (
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
            {visibleColumns.map(col => <th key={col.field}>{col.header}</th>)}
            <th>Act</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {visibleColumns.map(col => (
                <td key={col.field}>
                  {editingItem.table === table && editingItem.id === item.id && isEditable(col.field) ? (
                    col.field === 'mode' && table === 'transitLines' ? (
                      console.log(`Editing transit lines mode value :${item['mode_id']}`),
                      <select
                        value={String(item['mode_id'])}
                        onChange={(e) => handleChange(item.id, col.field, e.target.value)}
                      >
                        {
                          transportModes?.map(mode => (
                            <option key={mode.id} value={mode.id}>
                              {mode.name}
                            </option>
                          ))}
                      </select>
                    ) : col.field === 'stop_id' && table === 'lineStops' ? (
                      <select
                        value={item[col.field]}
                        onChange={(e) => handleChange(item.id, col.field, e.target.value)}
                      >
                        {transitStops?.map(stop => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </select>
                    ) : col.field === 'color' && table === 'transitLines' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={item[col.field] || '#808080'}
                          onChange={(e) => handleChange(item.id, col.field, e.target.value)}
                          className="p-1 border rounded"
                          style={{
                            backgroundColor: item[col.field] || '#808080',
                            color: getContrastColor(item[col.field] || '#808080')
                          }}
                        >
                          {TRANSIT_COLORS.map(color => (
                            <option
                              key={color.value}
                              value={color.value}
                              style={{
                                backgroundColor: color.value,
                                color: getContrastColor(color.value)
                              }}
                            >
                              {color.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : col.field === 'isStation' ? (
                      <input
                        type="checkbox"
                        checked={item[col.field]}
                        onChange={(e) => handleChange(item.id, col.field, e.target.checked)}
                      />
                    ) : col.field === 'stop_name' && table === 'lineStops' ? (
                      getStopNameById(item.stop_id)
                    ) : (
                      <input
                        type={typeof item[col.field] === 'number' ? 'number' : 'text'}
                        value={item[col.field] !== null ? item[col.field] : ''}
                        onChange={(e) => handleChange(item.id, col.field, e.target.value)}
                      />
                    )
                  ) : (
                    col.field === 'stop_name' && table === 'lineStops' ? (
                      getStopNameById(item.stop_id)
                    ) : col.field === 'mode' && table === 'transitLines' ? (
                      getModeNameById(item.mode_id)
                    ) : col.field === 'isStation' && table === 'transitStops' ? (
                      formatValue(item[col.field], col.field)
                    ) : col.field === 'color' && table === 'transitLines' ? (
                      <div
                        style={{
                          backgroundColor: item[col.field] || '#808080',
                          width: '20px',
                          height: '20px',
                          margin: '0 auto',
                          border: '1px solid #ddd',
                          borderRadius: '3px'
                        }}
                      />
                    ) : (
                      formatValue(item[col.field], col.field)
                    )
                  )}
                </td>
              ))}
              <td>
                {editingItem.table === table && editingItem.id === item.id ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      className="save-button"
                      >
                      Save
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="cancel-button"
                      >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEdit(item.id)}
                    className="edit-button"
                    >
                    Edit
                  </button>
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