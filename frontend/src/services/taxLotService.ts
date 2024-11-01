import api from './api';
import { TaxLot } from '../types/types';

export const taxLotService = {
  getAll: () => api.get<TaxLot[]>('/tax-lots'),
  
  getById: (id: string) => api.get<TaxLot>(`/tax-lots/${id}`),
  
  getNearLine: (lineId: number) => 
    api.get<TaxLot[]>(`/tax-lots/near-line/${lineId}`),
};
