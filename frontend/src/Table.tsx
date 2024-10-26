import React from 'react';
import { EditingItem, TransportMode, TransitStop } from './types';

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
  transitStops
}) => {
  // For transit stops, only show editable name field

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
        <button 
          onClick={handleAdd}
          className={table === 'transitStops' && editingItem.table === 'transitStops' ? 'active' : ''}
        >
          {table === 'transitStops' && editingItem.table === 'transitStops' 
            ? 'Click on map to place stop' 
            : 'Add New'}
        </button>
        {table === 'transitStops' && editingItem.table === 'transitStops' && (
          <div className="help-text">Click anywhere on the map to place the new stop</div>
        )}
      </div>
    </div>
  );
};

export default Table;