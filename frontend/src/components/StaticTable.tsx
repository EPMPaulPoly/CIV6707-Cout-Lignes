import React, { useState } from 'react';
import { LineCostInventory, TransitLine } from '../types/types';
import { lineService } from '../services';

interface ColumnMapping {
  field: string;
  header: string;
}

interface StaticTableProps {
  table: string;
  data: any[];
  columns: ColumnMapping[];
  transitLines: TransitLine[];
  setLineCosts: React.Dispatch<React.SetStateAction<LineCostInventory[]>>;
}

const StaticTable: React.FC<StaticTableProps> = ({
  table,
  data,
  columns,
  transitLines,
  setLineCosts
}) => {
  // Filter out latitude and longitude columns for transit stops table
  const visibleColumns = table === 'lineCosts'
    ? columns.filter(col => !['affectedLotIds'].includes(col.field))
    : columns;
  const formatValue = (value: any, field: string) => {
    if (field === 'parcelsWithinBuffer') {
      return parseInt(value).toLocaleString('en');
    } else if (field === 'totalPropertyValue') {
      return parseInt(value).toLocaleString('en');
    } else if(field ==='lineLength'){
      return value !== null ? value.toFixed(1) : '';
    }
    return value;
  };

  const getLineNameById = (item_id: number) => {
    const line = transitLines?.find(l => l.id === item_id);
    return line ? line.name : 'Unknown Line';
  };

  const handleCostRetrieval = async(setLineCosts:React.Dispatch<React.SetStateAction<LineCostInventory[]>>) => {
    const [costResponse] = await Promise.all([
      lineService.getAllLineCosts()
    ]);
    setLineCosts(costResponse.data);
  };

  const renderCostControls = () => {
    return (
      <button
        onClick={(e: React.MouseEvent) => handleCostRetrieval(setLineCosts)}
        className="standard-add-button"
      >
        Get Costs
      </button>);
    };
return (
  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          {visibleColumns.map(col => <th key={col.field}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {visibleColumns.map(col => (//item[col.field]
              <td key={col.field}>
                {col.field === 'id' && table === 'lineCosts' ? (
                  getLineNameById(item.id)
                ) : (
                  formatValue(item[col.field], col.field)
                )}

              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {<div className="table-controls">
      {renderCostControls()}
    </div>}
  </div>
);
  };


export default StaticTable;