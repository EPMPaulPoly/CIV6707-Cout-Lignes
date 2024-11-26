import {
  EditingItem, TransitStop, TransitLine, TransportMode, LineStop,
  ApiResponse,
  ServiceResponse,
  NewItem,
  MaybeServiceResponse,
  ApiStopResponse,
  ApiLineResponse,
  ApiModeResponse, WKBHexString,
  ApiLineStopResponse, InsertPosition,
  ApiLineStopsResponse
} from '../types/types';
import { Dispatch, SetStateAction } from 'react';
import { stopService, lineService, modeService } from '../services';
import { Position } from '../types/types';

// Define valid table names as a literal type
type TableName = 'transitStops' | 'transitLines' | 'transportModes' | 'lineStops';

interface DefaultValues {
  transitStops: Omit<TransitStop, 'id'>;
  transitLines: Omit<TransitLine, 'id'>;
  transportModes: Omit<TransportMode, 'id'>;
  lineStops: Omit<LineStop, 'id'>;
}

const getModeIdbyName = (mode_name: any, data: TransportMode[]): number => {
  const mode = data.find(m => m.name === mode_name);
  return mode ? mode.id : 0;
}

export const calculateNewOrder = (
  currentStops: LineStop[],
  insertPosition: InsertPosition
): number => {
  switch (insertPosition.type) {
    case 'first':
      return Math.min(...currentStops.map(ls => ls.order_of_stop), 1) - 1;

    case 'after':
      if (insertPosition.afterStopId) {
        const afterStop = currentStops.find(ls => ls.id === insertPosition.afterStopId);
        if (afterStop) {
          return afterStop.order_of_stop + 1;
        }
      }
      return currentStops.length + 1;

    case 'last':
    default:
      return Math.max(...currentStops.map(ls => ls.order_of_stop), 0) + 1;
  }
};


const defaultValues: DefaultValues = {
  transitStops: {
    name: '',
    position: { x: -8210165.31, y: 5702755.96 },    
    isStation: true,
    isComplete: false
  },
  transitLines: {
    name: '',
    description: '',
    mode_id: 0,
    color: '#808080'
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
                  : field === 'isStation'
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
  handleStopAdd: (position: Position) => void;
  handleStopMove: (stopId: number, position: Position) => void;
  handleStopDelete: (stopId: number) => void;
  handleStopEdit: (stopId: number) => void;
  setNewStopName: (name: string) => void;
}

export const handleAdd = async (
  table: TableName,
  data: any[],
  setFunction: Dispatch<SetStateAction<any[]>>,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreation: boolean,
  setNewItemCreation: Dispatch<SetStateAction<boolean>>,
  additionalProps: Record<string, any> = {},
  setIsSelectingStops?: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setNewItemCreation(true);
    const getNextAvailableNumber = (items: any[], prefix: string) => {
      let maxNumber = 0;
      items.forEach(item => {
        if (item.name.startsWith(prefix)) {
          const number = parseInt(item.name.replace(prefix, ''));
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      return maxNumber + 1;
    };
    const getDefaultName = (table: TableName, items: any[]) => {
      switch (table) {
        case 'transitStops':
          return `New Stop ${getNextAvailableNumber(items, 'New Stop ')}`;
        case 'transitLines':
          return `New Line ${getNextAvailableNumber(items, 'New Line ')}`;
        case 'transportModes':
          return `New Transport Mode ${getNextAvailableNumber(items, 'New Transport Mode ')}`;
        default:
          return '';
      }
    };
    if (table === 'transitStops') {
      setEditingItem({ table, id: null });
    } else if (table === 'lineStops' && setIsSelectingStops) {
      setIsSelectingStops(true);
    } else {
      const newId = Math.max(...data.map(item => item.id), 0) + 1;
      const defaultName = getDefaultName(table, data);
      const defaultValues = getDefaultValues(table);
      
      const newItem = {
        id: newId,
        ...defaultValues,
        name: defaultName,  // Utilise le nom généré automatiquement
        ...additionalProps
      };

      setFunction([...data, newItem]);
      setEditingItem({ table, id: newId });
    }
  } catch (error) {
    console.error(`Error adding to ${table}:`, error);
  }
};

export const handleEdit = (
  table: string,
  id: number,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  data: any[],
  setOriginalItem: Dispatch<SetStateAction<any>>
) => {
  const itemToEdit = data.find(item => item.id === id);
  if (itemToEdit) {
    setOriginalItem({ ...itemToEdit });
    setEditingItem({ table, id });
  }
};

export const handleCancel = (
  editingItem: EditingItem,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  originalItem: any,
  setOriginalItem: Dispatch<SetStateAction<any>>,
  setFunction: Dispatch<SetStateAction<any[]>>,
  setNewItemCreation: Dispatch<SetStateAction<boolean>>
) => {
  if (originalItem) {
    setFunction(prevData =>
      prevData.map(item =>
        item.id === editingItem.id ? originalItem : item
      )
    );
  }
  setEditingItem({ table: '', id: null });
  setOriginalItem(null);
  setNewItemCreation(false);
};

export const handleSave = async (
  table: string,
  editingItem: EditingItem,
  setFunction: Dispatch<SetStateAction<any[]>>,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreationBool: boolean,
  setNewItemCreation: Dispatch<SetStateAction<boolean>>,
  data: any[]
) => {
  try {
    if (editingItem.id === null) return;
    let response: ApiStopResponse | ApiLineResponse | ApiModeResponse | ApiLineStopResponse | ApiLineStopsResponse | undefined;
    let data_to_put: any;
    if (newItemCreationBool === true) {
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
          response = await modeService.create(data_to_put);
          break;
        case 'lineStops':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await lineService.addRoutePoint(editingItem.id, data_to_put);
          break;
      }
    } else if (newItemCreationBool == false) {
      switch (table) {
        case 'transitStops':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await stopService.update(editingItem.id, data_to_put);
          break;
        case 'transitLines':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await lineService.update(editingItem.id, data_to_put);
          break;
        case 'transportModes':
          data_to_put = Object.fromEntries(Object.entries(data.find(o => o.id === editingItem.id)).filter(([key]) => key !== 'id'));
          response = await modeService.update(editingItem.id, data_to_put);
          break;
        case 'lineStops':
          data_to_put = data;
          response = await lineService.updateRoutePoints(editingItem.id, data_to_put);
          break;
      }
    }

    if (response?.data) {
      const updatedItems = Array.isArray(response.data)
        ? response.data as Array<TransitStop | TransitLine | TransportMode | LineStop>
        : [response.data];

      setFunction(prevData =>
        prevData.map(item => {
          const updatedItem = updatedItems.find((update) => update.id === item.id);
          return updatedItem || item;
        })
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
      case 'lineStops':
        // Find the lineStop to be deleted
        const lineStopToDelete = lineStops.find(ls => ls.id === id);
        if (!lineStopToDelete) {
          throw new Error('LineStop not found');
        }

        // Get all lineStops for the same line
        const sameLineStops = lineStops.filter(ls => ls.line_id === lineStopToDelete.line_id);
        
        // Find stops that need to be reordered (those after the deleted stop)
        const stopsToReorder = sameLineStops.filter(
          ls => ls.order_of_stop > lineStopToDelete.order_of_stop
        );

        // Delete the lineStop
        await lineService.deleteRoutePoint(lineStopToDelete.line_id, id);

        if (stopsToReorder.length > 0) {
          // Reorder remaining stops
          const updatedStops = stopsToReorder.map(stop => ({
            ...stop,
            order_of_stop: stop.order_of_stop - 1
          }));

          // Update the order of remaining stops
          await lineService.updateRoutePoints(lineStopToDelete.line_id, [
            ...sameLineStops.filter(ls => ls.order_of_stop < lineStopToDelete.order_of_stop),
            ...updatedStops
          ]);

          // Update local state with reordered stops
          setFunction(prev => [
            ...prev.filter(ls => ls.line_id !== lineStopToDelete.line_id),
            ...sameLineStops
              .filter(ls => ls.id !== id)
              .map(ls => ({
                ...ls,
                order_of_stop: ls.order_of_stop > lineStopToDelete.order_of_stop
                  ? ls.order_of_stop - 1
                  : ls.order_of_stop
              }))
          ]);
        } else {
          // If it's the last stop or no reordering needed, just remove it from state
          setFunction(prev => prev.filter(item => item.id !== id));
        }
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

export const wkbHexToPosition = (wkbHex: WKBHexString): Position => {
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

  return {x, y};  // Retourne directement les coordonnées EPSG:3857
};

export const createMapHandlers = (
  transitStops: TransitStop[],
  setTransitStops: Dispatch<SetStateAction<TransitStop[]>>,
  lineStops: LineStop[],
  editingItem: EditingItem,
  setEditingItem: Dispatch<SetStateAction<EditingItem>>,
  newItemCreation: boolean,
  setNewItemCreation: Dispatch<SetStateAction<boolean>>
): MapHandlers => {
  let newStopName = '';

  const setNewStopName = (name: string) => {
    newStopName = name;
  };

  return {
    handleStopAdd: async (position: Position) => {
      if (editingItem.table === 'transitStops' && editingItem.id === null) {
        try {
          let defaultName = newStopName;
          if (!defaultName) {
            let maxNumber = 0;
            transitStops.forEach(stop => {
              if (stop.name.startsWith('New Stop ')) {
                const number = parseInt(stop.name.replace('New Stop ', ''));
                if (!isNaN(number) && number > maxNumber) {
                  maxNumber = number;
                }
              }
            });
            defaultName = `New Stop ${maxNumber + 1}`;
          }
          const newStop: Omit<TransitStop, 'id' | 'isComplete'> = {
            name: defaultName,
            position,
            isStation: true
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

    handleStopMove: async (stopId: number, position: Position) => {
      try {
        // Find the existing stop first
        const existingStop = transitStops.find(stop => stop.id === stopId);
        if (!existingStop) {
          console.error(`Stop with id ${stopId} not found`);
          return;
        }
    
        // Prepare update payload
        const updatedStop: Omit<TransitStop, 'id' | 'isComplete'> = {
          name: existingStop.name,
          position,
          isStation: existingStop.isStation // Preserve existing isStation value
        };
    
        // Make API call
        const response: ApiResponse<TransitStop> = await stopService.update(stopId, updatedStop);
    
        // Handle successful response
        if (response.success && response.data) {
          setTransitStops(prevStops =>
            prevStops.map(stop => 
              stop.id === stopId ? { ...stop, ...response.data } : stop
            )
          );
        } else {
          console.error('Failed to update stop:', response.error);
        }
      } catch (error) {
        console.error('Error moving stop:', error);
        // Here you might want to show a user-friendly error message
        // For example: toast.error('Failed to move stop. Please try again.');
      }
    },

    handleStopDelete: async (stopId: number) => {
      try {
        const stopInUse = lineStops.some(ls => ls.stop_id === stopId);
        if (stopInUse) {
          alert('Cannot delete stop that is part of a line. Remove it from all lines first.');
          return;
        }
        let response: any;
        response = await stopService.delete(stopId);

        if (editingItem.table === 'transitStops' && editingItem.id === stopId) {
          setEditingItem({ table: '', id: null });
        }

        setTransitStops(prev => prev.filter(stop => stop.id !== stopId));
      } catch (error) {
        console.error('Error deleting stop:', error);
      }
    },

    handleStopEdit: (stopId: number) => {
      setEditingItem({ table: 'transitStops', id: stopId });
      setNewItemCreation(false);
    },

    setNewStopName
  };
};

export const getContrastColor = (hexcolor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};