import api from './api';
import { TransitStop } from '../types/types';

export const stopService = {
  getAll: () => api.get<TransitStop[]>('/stops'),
  
  getById: (id: number) => 
    api.get<TransitStop>(`/stops/${id}`),
  
  create: (data: Omit<TransitStop, 'id'>) =>
    api.post<TransitStop>('/stops', data),
  
  update: (id: number, data: Partial<TransitStop>) =>
    api.put<TransitStop>(`/stops/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/stops/${id}`)
};