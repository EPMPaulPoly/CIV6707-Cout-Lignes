import React, { useState } from 'react';
import { LineCostInventory, TransitLine } from '../types/types';
import { lineService } from '../services';
import { cadastreService } from '../services/cadastreService';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon,MultiPolygon } from 'geojson';
interface ColumnMapping {
  field: string;
  header: string;
}

interface CadastreProperties {
  ogc_fid:number;
  value_total: number;
}

interface StaticTableProps {
  table: string;
  data: any[];
  columns: ColumnMapping[];
  transitLines: TransitLine[];
  setLineCosts: React.Dispatch<React.SetStateAction<LineCostInventory[]>>;
  setCadastreLots: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection | null>>;
}

const StaticTable: React.FC<StaticTableProps> = ({
  table,
  data,
  columns,
  transitLines,
  setLineCosts,
  setCadastreLots
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
    } else if (field=='linearInfraCost'){
      return value !== null ? value.toFixed(0) : '';
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
    const lotIds = costResponse.data.flatMap((costItem: any) => costItem.affectedLotIds);
    const [lots_response] = await Promise.all([
      cadastreService.getCadastreByIds(lotIds)
    ]);
  
    // Ensure the geojsonData is of type Feature<Polygon, CadastreProperties>[]
    const geojsonData: Feature<Polygon | MultiPolygon, CadastreProperties>[] = lots_response.data
      .map(item => {
        const geometry = item.geojson_geometry;  // Assuming it's already GeoJSON (or in 4326)
      
        if (geometry) {
          // Check if the geometry is a Polygon or MultiPolygon
          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            return {
              type: "Feature",
              geometry: geometry,  // It could be either Polygon or MultiPolygon
              properties: {
                ogc_fid:item.ogc_fid,
                value_total: item.value_total
              },
            } as Feature<Polygon | MultiPolygon, CadastreProperties>;
          }
          
          console.warn('Unexpected geometry type:', geometry.type);
        }
    
        return null;  // Return null for invalid geometries
      })
      .filter((item): item is Feature<Polygon | MultiPolygon, CadastreProperties> => item !== null); // Type guard to remove nulls
  
    // Wrap in FeatureCollection
    const geojsonFeatureCollection: FeatureCollection<Polygon| MultiPolygon, CadastreProperties> = {
      type: "FeatureCollection",
      features: geojsonData,
    };
  
    setCadastreLots(geojsonFeatureCollection);
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