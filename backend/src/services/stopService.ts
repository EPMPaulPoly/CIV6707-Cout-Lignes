import api from './api';
import { TransitStop } from '../types';

export const stopService = {
  // Récupérer tous les arrêts
  getAll: () => api.get<TransitStop[]>('/stops'),
  
  // Récupérer un arrêt spécifique
  getById: (id: number) => api.get<TransitStop>(`/stops/${id}`),
  
  // Créer un nouvel arrêt
  create: (data: Omit<TransitStop, 'id'>) => 
    api.post<TransitStop>('/stops', data),
  
  // Mettre à jour un arrêt
  update: (id: number, data: Partial<TransitStop>) => 
    api.put<TransitStop>(`/stops/${id}`, data),
  
  // Supprimer un arrêt
  delete: (id: number) => api.delete(`/stops/${id}`)
};