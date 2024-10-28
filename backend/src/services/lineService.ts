import api from './api';
import { TransitLine, LineStop } from '../types';

export const lineService = {
  // Récupérer toutes les lignes
  getAll: () => api.get<TransitLine[]>('/lines'),
  
  // Récupérer une ligne spécifique
  getById: (id: number) => api.get<TransitLine>(`/lines/${id}`),
  
  // Créer une nouvelle ligne
  create: (data: Omit<TransitLine, 'id'>) => 
    api.post<TransitLine>('/lines', data),
  
  // Mettre à jour une ligne
  update: (id: number, data: Partial<TransitLine>) => 
    api.put<TransitLine>(`/lines/${id}`, data),
  
  // Supprimer une ligne
  delete: (id: number) => api.delete(`/lines/${id}`),

  // Récupérer les points d'arrêt d'une ligne
  getRoutePoints: (id: number) => 
    api.get<LineStop[]>(`/lines/${id}/route-points`),
  
  // Ajouter un point d'arrêt à une ligne
  addRoutePoint: (lineId: number, data: Omit<LineStop, 'id'>) => 
    api.post<LineStop>(`/lines/${lineId}/route-points`, data),

  // Mettre à jour l'ordre des points d'une ligne
  updateRoutePoints: (lineId: number, points: LineStop[]) =>
    api.put<LineStop[]>(`/lines/${lineId}/route-points`, points),
  
  // Calculer le prix d'une ligne
  calculatePrice: (id: number) => 
    api.get(`/lines/${id}/price`)
};
