import api from './api';
import { TransportMode, TransportModeDB, ApiModesResponse, ApiModeResponse, ApiResponse } from '../types/types';
import { AxiosResponse } from 'axios';

interface ApiModesDBResponse extends Omit<ApiModesResponse, 'data'> {
  data: TransportModeDB[];
}
interface ApiModeDBResponse extends Omit<ApiModeResponse, 'data'> {
  data: TransportModeDB;
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
          name: rest.name,
          costPerKm: rest.cost_per_km,
          costPerStation: rest.cost_per_station,
          footprint: rest.footprint
        };
        return mode;
      }),
      error: response.data.error
    };
  },

  getById: async (id: number): Promise<ApiModeResponse> => {
    const response: AxiosResponse<ApiModeDBResponse> = await api.get(`/modes/${id}`);
    const mode_base: TransportModeDB = response.data.data;
    return {
      success: response.data.success,
      data: {
        id: mode_base.mode_id,
        name: mode_base.name,
        costPerKm: mode_base.cost_per_km,
        costPerStation: mode_base.cost_per_station,
        footprint: mode_base.footprint
      },
      error: response.data.error
    };
  },


  create: async (data: Omit<TransportMode, 'id'>): Promise<ApiModeResponse> => {
    // Transform frontend camelCase to API snake_case
    const apiData = {
      name: data.name,
      cost_per_km: data.costPerKm,
      cost_per_station: data.costPerStation,
      footprint: data.footprint
    };

    const response: AxiosResponse<ApiModeDBResponse> = await api.post('/modes', apiData);

    // Transform API response back to frontend format
    const transformedResponse: ApiModeResponse = {
      success: response.data.success,
      data: {
        id: response.data.data.mode_id,
        name: response.data.data.name,
        costPerKm: response.data.data.cost_per_km,
        costPerStation: response.data.data.cost_per_station,
        footprint: response.data.data.footprint
      },
      error: response.data.error
    };

    return transformedResponse;
  },

  update: async (id: number, data: Partial<TransportMode>): Promise<ApiModeResponse> => {
    // Transform the input data to match DB format
    const dbData: Partial<TransportModeDB> = {
      ...(data.name && { name: data.name }),
      ...(data.costPerKm && { cost_per_km: data.costPerKm }),
      ...(data.costPerStation && { cost_per_station: data.costPerStation }),
      ...(data.footprint && { footprint: data.footprint })
    };

    const response: AxiosResponse<ApiModeDBResponse> = await api.put(`/modes/${id}`, dbData);

    // Transform the DB response to API response format
    return {
      success: response.data.success,
      data: {
        id: response.data.data.mode_id,
        name: response.data.data.name,
        costPerKm: response.data.data.cost_per_km,
        costPerStation: response.data.data.cost_per_station,
        footprint: response.data.data.footprint
      },
      error: response.data.error
    };
  },

  delete: (id: number) => api.delete(`/modes/${id}`)
};