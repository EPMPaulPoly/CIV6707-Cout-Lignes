import { EditingItem, TransitStop, TransitLine, TransportMode, LineStop } from './types';

export const isValidLatitude = (lat: number | string | null | undefined): boolean => {
  if (lat === null || lat === undefined) return false;
  const num = typeof lat === 'string' ? parseFloat(lat) : lat;
  return !isNaN(num) && num >= -90 && num <= 90;
};

export const isValidLongitude = (lon: number | string | null | undefined): boolean => {
  if (lon === null || lon === undefined) return false;
  const num = typeof lon === 'string' ? parseFloat(lon) : lon;
  return !isNaN(num) && num >= -180 && num <= 180;
};

export const handleTempChange = (
  id: number,
  field: string,
  value: string | number | boolean,
  setTempValues: React.Dispatch<React.SetStateAction<{[key: string]: any}>>
) => {
  setTempValues(prev => ({
    ...prev,
    [id]: {
      ...prev[id],
      [field]: value
    }
  }));
};

export const isValidInput = (item: any, table: string, tempValues: {[key: string]: any}) => {
  if (table === 'transitStops') {
    const lat = tempValues[item.id]?.latitude ?? item.latitude;
    const lon = tempValues[item.id]?.longitude ?? item.longitude;
    return isValidLatitude(lat) && isValidLongitude(lon);
  }
  return true;
};

export const handleChange = (
  table: string,
  id: number,
  field: string,
  value: string | number | boolean,
  setFunction: React.Dispatch<React.SetStateAction<any[]>>
) => {
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
};

export const handleAdd = (
  table: string,
  data: any[],
  setFunction: React.Dispatch<React.SetStateAction<any[]>>,
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>,
  additionalProps: Record<string, any> = {}
) => {
  const newId = Math.max(...data.map(item => item.id), 0) + 1;
  const newItem = { id: newId, ...getDefaultValues(table), ...additionalProps };
  setFunction([...data, newItem]);
  setEditingItem({ table, id: newId });
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
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>,
  tempValues: {[key: string]: any}
) => {
  setFunction(prevData => {
    if (editingItem.id === null) {
      console.error("Editing item id is null");
      return prevData;
    }

    const editingItemId = editingItem.id;
    const tempValue = tempValues[editingItemId] || {};

    const updatedData = prevData.map(item =>
      item.id === editingItemId
        ? {
            ...item,
            ...tempValue,
            isComplete: table === 'transitStops' 
              ? !!(tempValue.name) && 
                isValidLatitude(tempValue.latitude) && 
                isValidLongitude(tempValue.longitude)
              : true,
          }
        : item
    );
    if (!prevData.find(item => item.id === editingItemId)) {
      const newItem = {
        ...getDefaultValues(table),
        ...tempValue,
        id: editingItemId,
        isComplete: table === 'transitStops' 
          ? !!(tempValue.name) && 
            isValidLatitude(tempValue.latitude) && 
            isValidLongitude(tempValue.longitude)
          : true,
      };
      updatedData.push(newItem);
    }

    return updatedData;
  });
  setEditingItem({ table: '', id: null });
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
      return { stop_id: 0, order_of_stop: 0, is_station: false };
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

export {};