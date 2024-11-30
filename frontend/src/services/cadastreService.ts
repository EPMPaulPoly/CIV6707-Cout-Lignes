import api from './api';
import { ApiCadastresResponse, ApiRoleFonciersResponse, ApiCadastreIntersectionResponse, CadastreFeature,ApiCadastreResponse } from '../types/types';
import axios,{ AxiosResponse } from 'axios';
class CadastreService {
  async getIntersections(geometry: { type: string; coordinates: number[][][] }): Promise<ApiCadastreIntersectionResponse> {
    const { data } = await api.post('/cadastre/intersections', { geometry });
    return data;
  }

  async getCadastreInBounds(bounds: { type: string; coordinates: number[][][] }): Promise<ApiCadastresResponse> {
    const { data } = await api.post('/cadastre/bounds', { bounds });
    return data;
  }

  async getRoleFoncierInBounds(bounds: { type: string; coordinates: number[][][] }): Promise<ApiRoleFonciersResponse> {
    const { data } = await api.post('/cadastre/role-foncier/bounds', { bounds });
    return data;
  }

  async getCadastreByIds(ids: number[] ): Promise<ApiCadastresResponse>{
    try {
    const response: AxiosResponse<ApiCadastresResponse> = await api.post(`/cadastre/ids`,{ids});
    const data = response.data.data;

    // Parse GeoJSON geometry for each cadastre
    const cadastres = data.map((item: any) => ({
      ...item,
      geojson_geometry: JSON.parse(item.geojson_geometry), // Parse the GeoJSON string
    }));
    return {success:response.data.success,data:cadastres};
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.response?.data);
        console.error('Axios Error Status:', error.response?.status);
        console.error('Axios Error Data:', error.response?.data);
      } else {
        console.error('Unexpected Error:', error);
      }
      throw error; // Re-throw if necessary
    }
  }
}

export const cadastreService = new CadastreService();