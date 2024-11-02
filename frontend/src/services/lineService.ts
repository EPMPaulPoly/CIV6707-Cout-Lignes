import api from './api';
import { TransitLine,TransitLineDB, LineStop, ApiLinesResponse,ApiLineResponse,ApiStopResponse } from '../types/types';
import { AxiosResponse } from 'axios';


interface ApiLineDBResponse extends Omit<ApiLineResponse, 'data'> {
  data: TransitLineDB;
}

interface ApiStopsDBResponse extends Omit<ApiLinesResponse, 'data'> {
  data: TransitLineDB[];
}

export const lineService = {
  getAll: async (): Promise<ApiLinesResponse> => {
    const response: AxiosResponse<ApiLinesResponse> = await api.get('/lines');
    
    return {
      success: response.data.success,
      data: response.data.data.map((line: TransitLineDB) => ({
        ...line,
        id:line.id,
        name:line.name,
        description:line.description,
        mode_id: line.mode_id
      })),
      error: response.data.error
    };
  },
  
  getById: async (id: number): Promise<ApiLineResponse> => {
    const response: AxiosResponse<ApiLineResponse> = await api.get(`/stops/${id}`);
    const line = response.data.data;
    
    return {
      success: response.data.success,
      data: {
        ...line,
        id:line.id,
        name:line.name,
        description:line.description,
        mode_id: line.mode_id
      },
      error: response.data.error
    };
  },

  create: (data: Omit<TransitLine, 'id'>) => 
    api.post<TransitLine>('/lines', data),
  
  update: (id: number, data: Partial<TransitLine>) => 
    api.put<TransitLine>(`/lines/${id}`, data),
  
  delete: (id: number) => api.delete(`/lines/${id}`),

  // Points d'arrêt
  getRoutePoints: (id: number) => 
    api.get<LineStop[]>(`/lines/${id}/route-points`),
  
  addRoutePoint: (lineId: number, data: Omit<LineStop, 'id'>) => 
    api.post<LineStop>(`/lines/${lineId}/route-points`, data),

  updateRoutePoints: (lineId: number, points: LineStop[]) =>
    api.put<LineStop[]>(`/lines/${lineId}/route-points`, points),

  // Calcul des prix
  calculatePrice: (id: number) => 
    api.get(`/lines/${id}/price`)
};