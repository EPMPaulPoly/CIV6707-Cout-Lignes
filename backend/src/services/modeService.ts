import api from './api';
import { TransportMode } from '../types';

export const modeService = {
  // Récupérer tous les modes
  getAll: () => api.get<TransportMode[]>('/modes'),
  
  // Récupérer un mode spécifique
  getById: (id: number) => api.get<TransportMode>(`/modes/${id}`),
  
  // Créer un nouveau mode
  create: (data: Omit<TransportMode, 'id'>) => 
    api.post<TransportMode>('/modes', data),
  
  // Mettre à jour un mode
  update: (id: number, data: Partial<TransportMode>) => 
    api.put<TransportMode>(`/modes/${id}`, data),
  
  // Supprimer un mode
  delete: (id: number) => api.delete(`/modes/${id}`)
};
