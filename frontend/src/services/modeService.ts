import api from './api';
import { TransportMode,TransportModeDB,ApiModesResponse } from '../types/types';
import { AxiosResponse } from 'axios';

interface ApiModesDBResponse extends Omit<ApiModesResponse, 'data'> {
  data: TransportModeDB[];
}

export const modeService = {
  getAll: async (): Promise<ApiModesResponse> => {
    const response: AxiosResponse<ApiModesDBResponse> = await api.get('/modes');
    
    return {
      success: response.data.success,
      data: response.data.data.map(({ mode_id, ...rest }: TransportModeDB) => {
        // Create a new object that matches the LineStop type
        const mode: TransportMode = {
          id: mode_id,
          name:rest.name,
          costPerKm: rest.cost_per_km,
          costPerStation: rest.cost_per_station,
          footprint: rest.footprint
        };
        return mode;
      }),
      error: response.data.error
    };
  },
  
  getById: (id: number) => api.get<TransportMode>(`/modes/${id}`),
  
  create: (data: Omit<TransportMode, 'id'>) => 
    api.post<TransportMode>('/modes', data),
  
  update: (id: number, data: Partial<TransportMode>) => 
    api.put<TransportMode>(`/modes/${id}`, data),
  
  delete: (id: number) => api.delete(`/modes/${id}`)
};