import { EditingItem, TransitStop, TransitLine, TransportMode, LineStop } from './types';
import { Dispatch, SetStateAction } from 'react';

export const handleChange = (
  table: string,
  id: number,
  field: string,
  value: string | number | boolean,
  setFunction: React.Dispatch<React.SetStateAction<any[]>>
) => {
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
              [field]:
                field === 'is_station'
                  ? Boolean(value)
                  : ['latitude', 'longitude', 'costPerKm', 'costPerStation', 'footprint', 'order_of_stop'].includes(field)
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  }
};

export interface MapHandlers {
  handleStopAdd: (lat: number, lng: number) => void;  // Changed to handleStopAdd
  handleStopMove: (stopId: number, lat: number, lng: number) => void;
  handleStopDelete: (stopId: number) => void;
}


export const handleAdd = (
  table: string,
  data: any[],
  setFunction: Dispatch<SetStateAction<any[]>>,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  additionalProps: Record<string, any> = {},
  setIsSelectingStops?: Dispatch<SetStateAction<boolean>>
) => {
  console.log('handleAdd called:', {
    table,
    currentData: data.length,
    additionalProps
  });
  if (table === 'transitStops') {
    // For transit stops, we'll set editing state with null ID to indicate new stop
    console.log('Setting editing state for new transit stop');
    setEditingItem({ table, id: null });
  } else if (table === 'lineStops') {
    // For line stops, toggle selection mode
    if (setIsSelectingStops) {
      setIsSelectingStops((prevState: boolean): boolean => !prevState);
    }
  } else {
    // For other tables, add immediately
    const newId = Math.max(...data.map(item => item.id), 0) + 1;
    const newItem = { id: newId, ...getDefaultValues(table), ...additionalProps };
    setFunction([...data, newItem]);
    setEditingItem({ table, id: newId });
  }
};

export const handleEdit = (
  table: string,
  id: number,
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>
) => {
  setEditingItem({ table, id });
};

export const handleSave = (
  table: string,
  editingItem: EditingItem,
  setFunction: React.Dispatch<React.SetStateAction<any[]>>,
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>
) => {
  if (table === 'transitStops') {
    setFunction(prevData =>
      prevData.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              isComplete: item.name !== '' && item.latitude !== null && item.longitude !== null,
            }
          : item
      )
    );
  }
  setEditingItem({ table: '', id: null });
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


export const handleDelete = ({
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
    const modeInUse = transitLines.some(line => line.mode === mode?.name);
    if (modeInUse) {
      alert('Cannot delete transport mode that is in use by a line.');
      return;
    }
  }

  // If we're currently editing this item, cancel the edit
  if (editingItem.table === table && editingItem.id === id) {
    setEditingItem({ table: '', id: null });
  }

  setFunction(prev => prev.filter(item => item.id !== id));
};

const getDefaultValues = (table: string): Partial<TransitStop | TransitLine | TransportMode | LineStop> => {
  switch (table) {
    case 'transitStops':
      return { name: '', latitude: null, longitude: null, isComplete: false };
    case 'transitLines':
      return { name: '', description: '', mode: '' };
    case 'transportModes':
      return { name: '', costPerKm: 0, costPerStation: 0, footprint: 0 };
    case 'lineStops':
      return { stop_id: 0, order_of_stop: 0, is_station: true };
    default:
      return {};
  }
};

export const validateData = (data: any, table: string): boolean => {
  switch (table) {
    case 'transitStops':
      return data.name !== '' && data.latitude !== null && data.longitude !== null;
    case 'transitLines':
      return data.name !== '' && data.description !== '' && data.mode !== '';
    case 'transportModes':
      return data.name !== '' && data.costPerKm >= 0 && data.costPerStation >= 0 && data.footprint >= 0;
    case 'lineStops':
      return data.stop_id > 0 && data.order_of_stop > 0;
    default:
      return false;
  }
};

export const formatDataForDisplay = (data: any, table: string): string => {
  switch (table) {
    case 'transitStops':
      return `${data.name} (${data.latitude}, ${data.longitude})`;
    case 'transitLines':
      return `${data.name} - ${data.description} (${data.mode})`;
    case 'transportModes':
      return `${data.name} - $${data.costPerKm}/km, $${data.costPerStation}/station, ${data.footprint} footprint`;
    case 'lineStops':
      return `Stop ${data.stop_id}, Order: ${data.order_of_stop}, ${data.is_station ? 'Station' : 'Stop'}`;
    default:
      return JSON.stringify(data);
  }
};

// add Map handlers in order to interactively modify transit stops
export interface MapHandlers {
  handleStopAdd: (latitude: number, longitude: number) => void;
  handleStopMove: (stopId: number, latitude: number, longitude: number) => void;
  handleStopDelete: (stopId: number) => void;
  setNewStopName: (name: string) => void;
}

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
    handleStopAdd: (latitude: number, longitude: number) => {
      console.log('Creating new stop');
      // Changed condition to check if we're in "add new stop" mode
      if (editingItem.table === 'transitStops' && editingItem.id === null) {
        const newId = Math.max(...transitStops.map(s => s.id), 0) + 1;
        const newStop: TransitStop = {
          id: newId,
          name: newStopName || `New Stop ${newId}`,  // Default name
          latitude,
          longitude,
          isComplete: true
        };
        
        setTransitStops(prevStops => [...prevStops, newStop]);
        setEditingItem({ table: '', id: null }); // Clear editing state after adding
      } else{
        console.log('Not in correct state to add stop:', editingItem);
      }
      
    },
    
    handleStopMove: (stopId: number, latitude: number, longitude: number) => {
      setTransitStops(prevStops =>
        prevStops.map(stop =>
          stop.id === stopId
            ? { ...stop, latitude, longitude }
            : stop
        )
      );
    },

    handleStopDelete: (stopId: number) => {
      const stopInUse = lineStops.some(ls => ls.stop_id === stopId);
      
      if (stopInUse) {
        alert('Cannot delete stop that is part of a line. Remove it from all lines first.');
        return;
      }
      
      if (editingItem.table === 'transitStops' && editingItem.id === stopId) {
        setEditingItem({ table: '', id: null });
      }
      
      setTransitStops(prevStops =>
        prevStops.filter(stop => stop.id !== stopId)
      );
    },
    setNewStopName
  };
};


// This empty export makes the file a module
export {};