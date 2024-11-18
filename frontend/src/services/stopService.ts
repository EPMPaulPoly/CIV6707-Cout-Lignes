import api from './api';
import type { 
  TransitStop, 
  ApiStopResponse, 
  ApiStopsResponse,
  TransitStopDB
} from '../types/types';
import { AxiosResponse } from 'axios';

interface ApiStopDBResponse extends Omit<ApiStopResponse, 'data'> {
  data: TransitStopDB;
}

interface ApiStopsDBResponse extends Omit<ApiStopsResponse, 'data'> {
  data: TransitStopDB[];
}


const transformDBToTransitStop = (dbStop: TransitStopDB): TransitStop => {
  return {
    id: dbStop.stop_id,
    name: dbStop.name,
    position: {
      x: dbStop.x,
      y: dbStop.y
    },
    isStation: dbStop.is_station,
    isComplete: true
  };
};


export const stopService = {
  getAll: async (): Promise<ApiStopsResponse> => {
    console.log('entering get all stops')
    const response: AxiosResponse<ApiStopsDBResponse> = await api.get('/stops');
    console.log('got response on stopService')
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
      position: data.position,
      is_station: (data.isStation)
    };
    const response: AxiosResponse<ApiStopDBResponse> = await api.post('/stops', backendData);
    return {
      success: response.data.success,
      data: transformDBToTransitStop(response.data.data),
      error: response.data.error
    };
  },
 
  update: async (id: number, data: Partial<TransitStop>): Promise<ApiStopResponse> => {
    const backendData: Partial<TransitStop> = {
      ...(data.name && { name: data.name }),
      ...(data.position && { position: data.position }),
      ...(data.isStation !== undefined && { is_station: data.isStation }),
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