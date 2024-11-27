import { LatLng } from "leaflet";

export type WKBHexString = string;

export interface Position {
  x: number;
  y: number;
}

export interface TransitStop {
  id: number;
  name: string;
  position: Position;
  isStation: boolean;
  isComplete: boolean;
}

export interface TransitLine {
  id: number;
  name: string;
  description: string;
  mode_id: number;
  color: string;
}

export interface TransportMode {
  id: number;
  name: string;
  costPerKm: number;
  costPerStation: number;
  footprint: number;
}

export interface LineCostInventory {
  id: number;
  parcelsWithinBuffer: number;
  totalPropertyValue:number;
  affectedLotIds:string[];
  lineLength:number;
}

export interface ColumnMapping {
  field: string;
  header: string;
}

export interface LineCostInventoryDB {
  line_id: number;
  parcels_within_buffer: number;
  total_property_value:number;
  affected_lot_ids:string[];
  line_length:number;
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

export type ServiceResponse = ApiResponse<TransitStop | TransitLine | TransportMode | LineStop> | undefined;
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
  color: string;
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
  is_station: boolean;
  x: number;         // Coordonnée X en EPSG:3857
  y: number;         // Coordonnée Y en EPSG:3857
}

export interface TransitLineDB {
  line_id: number;
  name: string;
  description: string;
  mode_id: number;
  color: string;
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

export interface CadastreProperties {
  ogc_fid: number;
  no_lot: string;
  va_suprf_l: number;
  shape_area: number;
}

export interface RoleFoncierProperties {
  id_provinc: string;
  value_total: number;
  addresses_text: string;
  code_utilisation: number;
  land_area_sq_m: number;
  building_levels: number;
}

export interface CadastreFeature extends GeoJSON.Feature {
  properties: CadastreProperties;
}

export interface RoleFoncierFeature extends GeoJSON.Feature {
  properties: RoleFoncierProperties;
}

export interface CadastreIntersectionResult {
  nombre_points: number;
  valeur_totale: number;
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
    properties: {
      value_total: number;
      no_lot: string;
      addresses_text?: string;
    };
  }>;
}

export interface MapHandlers {
  handleStopAdd: (position: Position) => void;
  handleStopMove: (stopId: number, position: Position) => void;
  handleStopDelete: (stopId: number) => void;
  handleStopEdit: (stopId: number) => void;
  setNewStopName: (name: string) => void;
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
export type ApiLineCostReponse = ApiResponse<LineCostInventory>;
export type ApiLineCostsReponse = ApiResponse<LineCostInventory[]>;
export type ApiTaxLotResponse = ApiResponse<TaxLot>;
export type ApiTaxLotsResponse = ApiResponse<TaxLot[]>;
export type ApiLinePriceResponse = ApiResponse<LinePriceResponse>;
export type ApiCadastreResponse = ApiResponse<CadastreFeature>;
export type ApiCadastresResponse = ApiResponse<CadastreFeature[]>;
export type ApiRoleFoncierResponse = ApiResponse<RoleFoncierFeature>;
export type ApiRoleFonciersResponse = ApiResponse<RoleFoncierFeature[]>;
export type ApiCadastreIntersectionResponse = ApiResponse<CadastreIntersectionResult>;
export type CadastreFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, CadastreProperties>;
export type RoleFoncierFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, RoleFoncierProperties>;