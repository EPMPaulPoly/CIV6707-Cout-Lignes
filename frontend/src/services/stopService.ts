import api from './api';
import { wkbHexToLatLng } from '../utils/utils';
import type { 
  TransitStop, 
  ApiStopResponse, 
  ApiStopsResponse,
  TransitStopDB
} from '../types/types';
import { AxiosResponse } from 'axios';
import { LatLng } from 'leaflet';

interface ApiStopDBResponse extends Omit<ApiStopResponse, 'data'> {
  data: TransitStopDB;
}

interface ApiStopsDBResponse extends Omit<ApiStopsResponse, 'data'> {
  data: TransitStopDB[];
}

const convertLatLngToGeography = (position: LatLng): string => {
  // Convert LatLng to PostGIS format: SRID=4326;POINT(lng lat)
  return `SRID=4326;POINT(${position.lng} ${position.lat})`;
};

const transformDBToTransitStop = (dbStop: TransitStopDB): TransitStop => {
  return {
    id: dbStop.stop_id,
    name: dbStop.name,
    position: wkbHexToLatLng(dbStop.geography),
    isStation: dbStop.is_station,
    isComplete: true
  };
};


export const stopService = {
  getAll: async (): Promise<ApiStopsResponse> => {
    const response: AxiosResponse<ApiStopsDBResponse> = await api.get('/stops');
    
    return {
      success: response.data.success,
      data: response.data.data.map(transformDBToTransitStop),
      error: response.data.error
    };
  },
 
  getById: async (id: number): Promise<ApiStopResponse> => {
    const response: AxiosResponse<ApiStopDBResponse> = await api.get(`/stops/${id}`);
    const stop = response.data.data;
    
    return {
      success: response.data.success,
      data: transformDBToTransitStop(response.data.data),
      error: response.data.error
    };
  },
 
  create: async (data: Omit<TransitStop, 'id' | 'isComplete'>): Promise<ApiStopResponse> => {
    const backendData = {
      name: data.name,
      geography: convertLatLngToGeography(data.position),
      is_station: (data.isStation)
    };
    console.log('Puttin up stop, check output',backendData.name,backendData.is_station,backendData.geography)
    const response: AxiosResponse<ApiStopDBResponse> = await api.post('/stops', backendData);
    return {
      success: response.data.success,
      data: transformDBToTransitStop(response.data.data),
      error: response.data.error
    };
  },
 
  update: async (id: number, data: Partial<TransitStop>): Promise<ApiStopResponse> => {
    const backendData: Partial<TransitStopDB> = {
      ...(data.name && { name: data.name }),
      ...(data.position && { geography: convertLatLngToGeography(data.position) }),
      ...(data.isStation !== undefined && { isStation: data.isStation }),
    };
    
    const response: AxiosResponse<ApiStopDBResponse> = await api.put(`/stops/${id}`, backendData);
    return {
      success: response.data.success,
      data: transformDBToTransitStop(response.data.data),
      error: response.data.error
    };
  },
 
  delete: async (id: number): Promise<void> => {
    await api.delete(`/stops/${id}`);
  }
};