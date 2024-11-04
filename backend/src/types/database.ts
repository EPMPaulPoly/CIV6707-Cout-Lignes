export interface DbTransitStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_complete: boolean;
}

export interface DbTransitLine {
  id: number;
  name: string;
  description: string;
  mode: string;
}

export interface DbTransportMode {
  id: number;
  name: string;
  cost_per_km: number;
  cost_per_station: number;
  footprint: number;
}

export interface DbLineStop {
  assoc_id: number;
  line_id: number;
  stop_id: number;
  order_of_stop: number;
}

export interface DbTaxLot {
  id: string;
  property_cost: number;
  housing_units: number;
  tax_bill_numbers: string[];
  polygon: any; // Type PostgreSQL geometry
}