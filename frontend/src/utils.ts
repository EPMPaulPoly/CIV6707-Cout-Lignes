import { EditingItem, TransitStop, TransitLine, TransportMode, LineStop } from './types';

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

// This empty export makes the file a module
export {};