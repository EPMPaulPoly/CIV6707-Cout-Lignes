export interface TransitStop {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    isComplete: boolean;
  }
  
  export interface TransitLine {
    id: number;
    name: string;
    description: string;
    mode: string;
  }
  
  export interface TransportMode {
    id: number;
    name: string;
    costPerKm: number;
    costPerStation: number;
    footprint: number;
  }
  
  export interface LineStop {
    id: number;
    line_id: number;
    stop_id: number;
    order_of_stop: number;
    is_station: boolean;
  }
  
  export interface EditingItem {
    table: string;
    id: number | null;
  }