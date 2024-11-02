import api from './api';
import { TransitLine,TransitLineDB, LineStop, TransitLineStopDB,ApiLinesResponse,ApiLineResponse,ApiStopResponse, ApiLineStopsResponse } from '../types/types';
import { AxiosResponse } from 'axios';



interface ApiLineStopsDBResponse extends Omit<ApiLineStopsResponse, 'data'> {
  data: TransitLineStopDB[];
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
  getAllRoutePoints: async (): Promise<ApiLineStopsResponse> => {
    const response: AxiosResponse<ApiLineStopsDBResponse> = await api.get(`/lines/route-points`);
    console.log('getting all routepoints')
    return {
      success: response.data.success,
      data: response.data.data.map(({ assoc_id, ...rest }: TransitLineStopDB) => {
        // Create a new object that matches the LineStop type
        const lineStop: LineStop = {
          id: assoc_id,
          line_id: rest.line_id,
          stop_id: rest.stop_id,
          order_of_stop: rest.order_of_stop
        };
        return lineStop;
      }),
      error: response.data.error
    };
  },

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