import { EditingItem, TransitStop, TransitLine, TransportMode, LineStop,
  ApiResponse,
  ServiceResponse,
  NewItem,
  MaybeServiceResponse,
  ApiStopResponse,
  ApiLineResponse,
  ApiModeResponse,WKBHexString} from '../types/types';
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
  setFunction: React.Dispatch<React.SetStateAction<any[]>>
) => {
  try {
    let response: ApiStopResponse | ApiLineResponse | ApiModeResponse | undefined;
    
    if (table === 'transitStops') {
      response = await stopService.update(id, {
        [field]: value,
        isComplete: field === 'name' ? Boolean(value) : undefined
      });
    } else {
      switch (table) {
        case 'transitLines':
          response = await lineService.update(id, { [field]: value });
          break;
        case 'transportModes':
          response = await modeService.update(id, { [field]: value });
          break;
      }
    }

    if (response?.data) {
      setFunction(prevData =>
        prevData.map(item =>
          item.id === id ? response!.data : item
        )
      );
    }
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
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
  additionalProps: Record<string, any> = {},
  setIsSelectingStops?: Dispatch<SetStateAction<boolean>>
) => {
  try {
    if (table === 'transitStops') {
      setEditingItem({ table, id: null });
    } else if (table === 'lineStops') {
      if (setIsSelectingStops) {
        setIsSelectingStops(true);
      }
    } else {
      let response: ApiLineResponse | ApiModeResponse | undefined;

      switch (table) {
        case 'transitLines':{
          const baseItem = defaultValues.transitLines;
          const newItem = {
            ...baseItem,
            ...(additionalProps as Partial<TransitLine>)
          } satisfies Omit<TransitLine, 'id'>;
          response = await lineService.create(newItem);
          break;
        }
        case 'transportModes':{
          const baseItem = defaultValues.transportModes;
          const newItem = {
            ...baseItem,
            ...(additionalProps as Partial<TransportMode>)
          } satisfies Omit<TransportMode, 'id'>;
          response = await modeService.create(newItem);
          break;
        }
      }

      if (response?.data) {
        setFunction([...data, response.data]);
        setEditingItem({ table, id: response.data.id });
      }
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
  setEditingItem: Dispatch<SetStateAction<EditingItem>>
) => {
  try {
    if (editingItem.id === null) return;

    let response: ApiStopResponse | ApiLineResponse | ApiModeResponse | undefined;
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
  setEditingItem: Dispatch<SetStateAction<EditingItem>>
): MapHandlers => {
  let newStopName = '';

  const setNewStopName = (name: string) => {
    newStopName = name;
  };

  return {
    handleStopAdd: async (position: LatLng) => {
      if (editingItem.table === 'transitStops' && editingItem.id === null) {
        try {
          const newStop: Omit<TransitStop, 'id'> = {
            name: newStopName || `New Stop ${transitStops.length + 1}`,
            position,
            isStation: true,
            isComplete: true
          };
          
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