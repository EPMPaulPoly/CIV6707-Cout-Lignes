import api from './api';
import { TaxLot } from '../types';

export const taxLotService = {
  // Récupérer tous les lots
  getAll: () => api.get<TaxLot[]>('/tax-lots'),
  
  // Récupérer un lot spécifique
  getById: (id: string) => api.get<TaxLot>(`/tax-lots/${id}`),
  
  // Récupérer les lots près d'une ligne
  getNearLine: (lineId: number) => 
    api.get<TaxLot[]>(`/tax-lots/near-line/${lineId}`),
  
  // Récupérer les lots dans une zone
  getInArea: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => api.get<TaxLot[]>('/tax-lots/in-area', { params: bounds })
};