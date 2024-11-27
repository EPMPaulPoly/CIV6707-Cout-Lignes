import React, { useState } from 'react';
import { TransitLine } from '../types/types';

interface ColumnMapping {
    field: string;
    header: string;
  }
  
interface StaticTableProps {
    table: string;
    data: any[];
    columns: ColumnMapping[];
    transitLines: TransitLine[];
  }

  const StaticTable: React.FC<StaticTableProps> = ({
    table,
    data,
    columns,
    transitLines
  }) => {
    // Filter out latitude and longitude columns for transit stops table
    const visibleColumns = table === 'lineCosts' 
    ? columns.filter(col => !['affectedLotIds'].includes(col.field))
    : columns;
    const formatValue = (value: any, field: string) => {
        if (field ==='parcelsWithinBuffer') {
          return parseInt( value ).toLocaleString('en');
        } else if (field ==='totalPropertyValue') {
          return parseInt( value ).toLocaleString('en');
        } 
        return value;
    };

    const getLineNameById = (item_id:number)=>{
        const line = transitLines?.find(l => l.id === item_id);
        return line ? line.name : 'Unknown Line';
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
                        formatValue(item[col.field],col.field)
                    )}
                    
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  
export default StaticTable;