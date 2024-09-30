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
  transportModes,
  transitStops
}) => {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {columns.map(col => (
                <td key={col}>
                  {editingItem.table === table && editingItem.id === item.id ? (
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
                      : item[col]
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
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd}>Add New</button>
    </div>
  );
};

export default Table;