import api from './api';
import { TransitLine, TransitLineDB, LineStop, TransitLineStopDB, ApiLinesResponse, ApiLineResponse, ApiStopResponse, ApiLineStopsResponse, ApiLineStopResponse } from '../types/types';
import { AxiosResponse } from 'axios';



interface ApiLineStopsDBResponse extends Omit<ApiLineStopsResponse, 'data'> {
  data: TransitLineStopDB[];
}

interface ApiLineStopDBResponse extends Omit<ApiLineStopResponse, 'data'> {
  data: TransitLineStopDB;
}

export const lineService = {
  getAll: async (): Promise<ApiLinesResponse> => {
    const response: AxiosResponse<ApiLinesResponse> = await api.get('/lines');

    return {
      success: response.data.success,
      data: response.data.data.map((line: TransitLineDB) => ({
        ...line,
        id: line.id,
        name: line.name,
        description: line.description,
        mode_id: line.mode_id,
        color: line.color
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
        id: line.id,
        name: line.name,
        description: line.description,
        mode_id: line.mode_id,
        color: line.color
      },
      error: response.data.error
    };
  },

  create: (data: Omit<TransitLine, 'id'>) =>
    api.post<TransitLine>('/lines', data),

  update:async (id: number, data: Partial<TransitLine>):Promise<ApiLineResponse> =>{
    const response: AxiosResponse<ApiLineResponse>=await api.put(`/lines/${id}`, data);
    console.log('getting all routepoints')
    return {
      success: response.data.success,
      data: {
        id: response.data.data.mode_id,
        name: response.data.data.name,
        description: response.data.data.description,
        mode_id: response.data.data.mode_id,
        color: response.data.data.color
      },
      error: response.data.error
    };
  },

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

  addRoutePoint: async(lineId: number, data: Omit<LineStop, 'id'>): Promise<ApiLineStopResponse> =>{
    const apiData = {
      line_id: data.line_id,
      stop_id: data.stop_id,
      order_of_stop: data.order_of_stop
    };

    const response: AxiosResponse<ApiLineStopDBResponse>  = await api.post<ApiLineStopDBResponse>(`/lines/${lineId}/route-points`, apiData)
    const linestop_return =response.data.data;
    console.log('Putting up a new routepoint, processing the return to')
    return{
      success:response.data.success,
      data: {
        ...linestop_return,
        id:linestop_return.assoc_id,
        line_id:linestop_return.line_id,
        stop_id: linestop_return.stop_id,
        order_of_stop:linestop_return.order_of_stop
      },
      error: response.data.error
    }
  },

  updateRoutePoints: async (lineId: number, data: LineStop[]): Promise<ApiLineStopsResponse> => {
    const apiData:TransitLineStopDB[]= data.map((linestop: LineStop) => ({
      ...linestop,
      assoc_id: linestop.id,
      stop_id:  linestop.stop_id,
      order_of_stop: linestop.order_of_stop,
      line_id:linestop.line_id
    }));
    const response: AxiosResponse<ApiLineStopsDBResponse> = await api.put<ApiLineStopsDBResponse>(`/lines/${lineId}/route-points`, apiData);

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
  // Calcul des prix
  calculatePrice: (id: number) =>
    api.get(`/lines/${id}/price`)
};