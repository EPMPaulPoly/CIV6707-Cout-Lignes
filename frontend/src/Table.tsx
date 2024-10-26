import React from 'react';
import { EditingItem, TransportMode, TransitStop } from './types';
import {MapHandlers} from './utils';

interface TableProps {
  table: string;
  data: any[];
  columns: string[];
  editingItem: EditingItem;
  handleChange: (id: number, field: string, value: string | number | boolean) => void;
  handleEdit: (id: number) => void;
  handleSave: () => void;
  handleAdd: () => void;
  handleDelete:(id:number) =>void;
  transportModes?: TransportMode[];
  transitStops?: TransitStop[];
  mapHandlers?: MapHandlers; 
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
  mapHandlers
}) => {
  // For transit stops, only show editable name field
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Safely access mapHandlers
    mapHandlers?.setNewStopName(value);
    handleChange(0, 'name', value);
  };
  // format the lat long for 4 digits
  const formatValue = (value: any, column: string) => {
    if (table === 'transitStops' && ['latitude', 'longitude'].includes(column)) {
      return value !== null ? value.toFixed(4) : '';
    }
    return value;
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

  const renderStopControls = () => {
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
    }
    
    return (
      <button 
        onClick={handleAdd}
        className="stop-add-button"
      >
        Add New Stop
      </button>
    );
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
                        value={item[col]}
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
                    col === 'stop_id' && table === 'lineStops' 
                      ? transitStops?.find(stop => stop.id === item[col])?.name 
                      : formatValue(item[col], col)
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
      <div className="table-controls">
        {table === 'transitStops' ? (
          <div className="stop-controls">
            <div className="stop-edit-message">
              {renderStopControls()}
            </div>
          </div>
        ) : (
          <button 
            onClick={handleAdd}
            className="standard-add-button"
          >
            Add New
          </button>
        )}
      </div>
    </div>
  );
};

export default Table;