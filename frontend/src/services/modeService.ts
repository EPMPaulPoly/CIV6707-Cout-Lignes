import api from './api';
import { TransportMode } from '../types/types';

export const modeService = {
  getAll: () => api.get<TransportMode[]>('/modes'),
  
  getById: (id: number) => api.get<TransportMode>(`/modes/${id}`),
  
  create: (data: Omit<TransportMode, 'id'>) => 
    api.post<TransportMode>('/modes', data),
  
  update: (id: number, data: Partial<TransportMode>) => 
    api.put<TransportMode>(`/modes/${id}`, data),
  
  delete: (id: number) => api.delete(`/modes/${id}`)
};