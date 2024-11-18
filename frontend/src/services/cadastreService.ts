import api from './api';
import { ApiCadastresResponse, ApiRoleFonciersResponse, ApiCadastreIntersectionResponse } from '../types/types';

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
}

export const cadastreService = new CadastreService();