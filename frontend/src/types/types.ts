import { LatLng } from "leaflet";

export type WKBHexString = string;



export interface TransitStop {
    id: number;
    name: string;
    position: LatLng;
    isStation:boolean;
    isComplete: boolean;
  }

  export interface TransitLine {
    id: number;
    name: string;
    description: string;
    mode_id: number;
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
  }
  
  export interface EditingItem {
    table: string;
    id: number | null;
  }

  export interface TaxLot {
    id: string;
    propertyCost: number;
    housingUnits: number;
    taxBillNumbers: string[];
    polygon: LatLng[]; // Array of coordinates forming the polygon
  }

  export interface InsertPosition {
    type: 'first' | 'last' | 'after';
    afterStopId?: number;
  }

  // Types pour les réponses API
export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  error?: string;
}

export type ServiceResponse = ApiResponse<TransitStop | TransitLine | TransportMode | LineStop>| undefined;
export type MaybeServiceResponse = ServiceResponse[keyof ServiceResponse] | undefined;
export type NewItem = {
    transitStops: Omit<TransitStop, 'id'>;
    transitLines: Omit<TransitLine, 'id'>;
    transportModes: Omit<TransportMode, 'id'>;
    lineStops: Omit<LineStop, 'id'>;
};

// Types pour les calculs de prix
export interface LinePriceResponse {
  infrastructureCost: number;
  stationCost: number;
  totalCost: number;
}

// Types pour les requêtes
export interface CreateStopRequest {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CreateLineRequest {
  name: string;
  description: string;
  mode: string;
}

export interface CreateModeRequest {
  name: string;
  costPerKm: number;
  costPerStation: number;
  footprint: number;
}

export interface AddRoutePointRequest {
  stop_id: number;
  order_of_stop: number;
  is_station: boolean;
}

export interface TransitStopDB {
  stop_id: number;
  name: string;
  geography: string;
  is_station: boolean;
}

export interface TransitLineDB {
  id: number;
  name: string;
  description: string;
  mode_id: number;
}

export interface TransitLineStopDB {
  assoc_id: number;
  line_id: number;
  stop_id: number;
  order_of_stop: number;
}

export interface TransportModeDB {
  mode_id: number;
  name: string;
  cost_per_km: number;
  cost_per_station: number;
  footprint: number;
}

// Utilisé dans les services pour type les retours API
export type ApiStopResponse = ApiResponse<TransitStop>;
export type ApiStopsResponse = ApiResponse<TransitStop[]>;
export type ApiLineResponse = ApiResponse<TransitLine>;
export type ApiLinesResponse = ApiResponse<TransitLine[]>;
export type ApiModeResponse = ApiResponse<TransportMode>;
export type ApiModesResponse = ApiResponse<TransportMode[]>;
export type ApiLineStopResponse = ApiResponse<LineStop>;
export type ApiLineStopsResponse = ApiResponse<LineStop[]>;
export type ApiTaxLotResponse = ApiResponse<TaxLot>;
export type ApiTaxLotsResponse = ApiResponse<TaxLot[]>;
export type ApiLinePriceResponse = ApiResponse<LinePriceResponse>;