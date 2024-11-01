import api from './api';
import { TransitLine, LineStop } from '../types/types';

export const lineService = {
  getAll: () => api.get<TransitLine[]>('/lines'),
  
  getById: (id: number) => api.get<TransitLine>(`/lines/${id}`),
  
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