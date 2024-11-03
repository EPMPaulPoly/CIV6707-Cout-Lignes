import { EditingItem, TransitStop, TransitLine, TransportMode, LineStop,
  ApiResponse,
  ServiceResponse,
  NewItem,
  MaybeServiceResponse,
  ApiStopResponse,
  ApiLineResponse,
  ApiModeResponse,WKBHexString,
  ApiLineStopResponse} from '../types/types';
import { Dispatch, SetStateAction } from 'react';
import { stopService, lineService, modeService } from '../services';
import { LatLng } from 'leaflet';

// Define valid table names as a literal type
type TableName = 'transitStops' | 'transitLines' | 'transportModes' | 'lineStops';

interface DefaultValues {
  transitStops: Omit<TransitStop, 'id'>;
  transitLines: Omit<TransitLine, 'id'>;
  transportModes: Omit<TransportMode, 'id'>;
  lineStops: Omit<LineStop, 'id'>;
}

const getModeIdbyName = (mode_name: any,data:TransportMode[] ): number => {
  const mode = data.find(m => m.name === mode_name);
  return mode ? mode.id : 0;
}



const defaultValues: DefaultValues = {
  transitStops: {
    name: '',
    position: new LatLng(45.517356, -73.597384),
    isStation:true,
    isComplete: false
  },
  transitLines: {
    name: '',
    description: '',
    mode_id: 0
  },
  transportModes: {
    name: '',
    costPerKm: 0,
    costPerStation: 0,
    footprint: 0
  },
  lineStops: {
    stop_id: 0,
    line_id: 0,
    order_of_stop: 0
  }
};
export const handleChange = async (
  table: string,
  id: number,
  field: string,
  value: string | number | boolean,
  setFunction: React.Dispatch<React.SetStateAction<any[]>>,
  transport_modes?: TransportMode[]
) => {
  console.log('entering handle add')
  if (table === 'transitStops') {
    setFunction(prevData => {
      // Find the stop we're editing
      const stopToUpdate = prevData.find(item => item.id === id);
      
      if (!stopToUpdate) return prevData;

      return prevData.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              isComplete: field === 'name' ? Boolean(value) && item.latitude !== null : item.isComplete
            }
          : item
      );
  });
} else {
  setFunction(prevData =>
    prevData.map(item =>
      item.id === id
        ? {
            ...item,
            ...(field === 'mode' 
              ? { ['mode_id']: Number(value) }
              : {
                  [field]: ['latitude', 'longitude', 'costPerKm', 'costPerStation', 'footprint', 'order_of_stop'].includes(field)
                    ? Number(value)
                    : field === 'is_station'
                      ? Boolean(value)
                      : value
                })
          }
        : item
    )
  );
}
};

export interface MapHandlers {
  handleStopAdd: (position:LatLng) => void;
  handleStopMove: (stopId: number, position:LatLng) => void;
  handleStopDelete: (stopId: number) => void;
  setNewStopName: (name: string) => void;
}

export const handleAdd = async (
  table: TableName,
  data: any[],
  setFunction: Dispatch<SetStateAction<any[]>>,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreation:boolean,
  setNewItemCreation:Dispatch<SetStateAction<boolean>>,
  additionalProps: Record<string, any> = {},
  setIsSelectingStops?: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setNewItemCreation(true);
    console.log('handleAdd called:', {
      table,
      currentData: data.length,
      additionalProps
    });
    console.log(`Set newItemcreation to ${newItemCreation} `)
    if (table === 'transitStops') {
      // For transit stops, we'll set editing state with null ID to indicate new stop
      console.log('Setting editing state for new transit stop');
      setEditingItem({ table, id: null });
    } else if (table === 'lineStops') {
      // For line stops, toggle selection mode
      if (setIsSelectingStops) {
        setIsSelectingStops(true);
      }
    } else {
      // For other tables, add immediately
      const newId = Math.max(...data.map(item => item.id), 0) + 1;
      const newItem = { id: newId, ...getDefaultValues(table), ...additionalProps };
      setFunction([...data, newItem]);
      setEditingItem({ table, id: newId });
      console.log(`Setting item ${newId} in table ${table}`)
    }
  } catch (error) {
    console.error(`Error adding to ${table}:`, error);
  }
};

export const handleEdit = (
  table: string,
  id: number,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>
) => {
  setEditingItem({ table, id });
};

export const handleSave = async (
  table: string,
  editingItem: EditingItem,
  setFunction: Dispatch<SetStateAction<any[]>>,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreationBool:boolean,
  setNewItemCreation:Dispatch<SetStateAction<boolean>>,
  data: any[]
) => {
  try {
    if (editingItem.id === null) return;
    let response: ApiStopResponse | ApiLineResponse | ApiModeResponse | ApiLineStopResponse| undefined;
    let data_to_put:any;
    let data_to_put_less_id:any;
    if(newItemCreationBool===true) {
      switch (table) {
        case 'transitStops':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await stopService.create(data_to_put);
          break;
        case 'transitLines':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await lineService.create(data_to_put);
          break;
        case 'transportModes':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await modeService.create(data_to_put_less_id);
          break;
        case 'lineStops':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await lineService.addRoutePoint(editingItem.id,data_to_put);
          break;
      }
    } else if (newItemCreationBool==false){
      switch (table) {
        case 'transitStops':
          response = await stopService.update(editingItem.id, { isComplete: true });
          break;
        case 'transitLines':
          response = await lineService.getById(editingItem.id);
          break;
        case 'transportModes':
          response = await modeService.getById(editingItem.id);
          break;
      }
    }

    if (response?.data) {
      const responseData = response.data; // Store the data in a constant to ensure TypeScript knows it's defined
      setFunction(prevData =>
        prevData.map(item =>
          item.id === editingItem.id ? responseData : item
        )
      );
    }
  } catch (error) {
    console.error(`Error saving ${table}:`, error);
  } finally {
    setEditingItem({ table: '', id: null });
    setNewItemCreation(false);
  }
};

export interface DeleteHandlerParams {
  table: string;
  id: number;
  setFunction: Dispatch<SetStateAction<any[]>>;
  lineStops: LineStop[];
  transitStops: TransitStop[];
  transitLines: TransitLine[];
  transportModes: TransportMode[];
  editingItem: EditingItem;
  setEditingItem: Dispatch<SetStateAction<EditingItem>>;
}

export const handleDelete = async ({
  table,
  id,
  setFunction,
  lineStops,
  transitStops,
  transitLines,
  transportModes,
  editingItem,
  setEditingItem
}: DeleteHandlerParams) => {
  try {
    // Vérifications avant suppression
    if (table === 'transitLines') {
      const lineHasStops = lineStops.some(ls => ls.line_id === id);
      if (lineHasStops) {
        alert('Cannot delete line that has stops. Remove all stops from the line first.');
        return;
      }
    } else if (table === 'transitStops') {
      const stopInUse = lineStops.some(ls => ls.stop_id === id);
      if (stopInUse) {
        alert('Cannot delete stop that is part of a line. Remove it from all lines first.');
        return;
      }
    } else if (table === 'transportModes') {
      const mode = transportModes.find(m => m.id === id);
      const modeInUse = transitLines.some(line => line.mode_id === mode?.id);
      if (modeInUse) {
        alert('Cannot delete transport mode that is in use by a line.');
        return;
      }
    }

    // Suppression dans la base de données
    let response;
    switch (table) {
      case 'transitStops':
        response = await stopService.delete(id);
        break;
      case 'transitLines':
        response = await lineService.delete(id);
        break;
      case 'transportModes':
        response = await modeService.delete(id);
        break;
    }

    // Mise à jour du state
    if (editingItem.table === table && editingItem.id === id) {
      setEditingItem({ table: '', id: null });
    }
    setFunction(prev => prev.filter(item => item.id !== id));

  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
  }
};

export const getDefaultValues = <T extends keyof typeof defaultValues>(
  table: T
): typeof defaultValues[T] => {
  return defaultValues[table];
};

export const wkbHexToLatLng = (wkbHex: WKBHexString): LatLng => {
  const hexToDouble = (hex: string): number => {
      const buffer = new DataView(new ArrayBuffer(8));
      for (let i = 0; i < 8; i++) {
          buffer.setUint8(i, parseInt(hex.substring(i * 2, (i + 1) * 2), 16));
      }
      return buffer.getFloat64(0, true);
  };

  const geomHex = wkbHex.slice(18);
  const x = hexToDouble(geomHex.slice(0, 16));
  const y = hexToDouble(geomHex.slice(16, 32));
  
  return new LatLng(y,x);  // Return as LatLng object instead of tuple
};

export const createMapHandlers = (
  transitStops: TransitStop[],
  setTransitStops: Dispatch<SetStateAction<TransitStop[]>>,
  lineStops: LineStop[],
  editingItem: EditingItem,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreation:boolean,
  setNewItemCreation:  Dispatch<SetStateAction<boolean>>
): MapHandlers => {
  let newStopName = '';

  const setNewStopName = (name: string) => {
    newStopName = name;
  };

  return {
    handleStopAdd: async (position: LatLng) => {
      if (editingItem.table === 'transitStops' && editingItem.id === null) {
        try {
          const newStop: Omit<TransitStop, 'id'|'isComplete'> = {
            name: newStopName || `New Stop ${transitStops.length + 1}`,
            position,
            isStation: true
          };
          console.log('Test hot reload')
          const response = await stopService.create(newStop);
          if (response.success && response.data) {
            setTransitStops(prev => [...prev, response.data]);
            setEditingItem({ table: '', id: null });
          }
        } catch (error) {
          console.error('Error adding stop:', error);
        }
      }
    },
    
    handleStopMove: async (stopId: number, position: LatLng) => {
      try {
        const response = await stopService.update(stopId, { position });
        if (response.success && response.data) {
          setTransitStops(prev =>
            prev.map(stop => stop.id === stopId ? response.data : stop)
          );
        }
      } catch (error) {
        console.error('Error moving stop:', error);
      }
    },

    handleStopDelete: async (stopId: number) => {
      try {
        const stopInUse = lineStops.some(ls => ls.stop_id === stopId);
        if (stopInUse) {
          alert('Cannot delete stop that is part of a line. Remove it from all lines first.');
          return;
        }
        
        await stopService.delete(stopId);
        
        if (editingItem.table === 'transitStops' && editingItem.id === stopId) {
          setEditingItem({ table: '', id: null });
        }
        
        setTransitStops(prev => prev.filter(stop => stop.id !== stopId));
      } catch (error) {
        console.error('Error deleting stop:', error);
      }
    },
    
    setNewStopName
  };
};