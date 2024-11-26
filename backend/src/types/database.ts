export interface DbTransitStop {
  id: number;
  name: string;
  is_station: boolean;
  x: number;  // Coordonnée X en EPSG:3857
  y: number;  // Coordonnée Y en EPSG:3857
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

export interface DbCadastre {
  ogc_fid: number;
  wkb_geometry: string;  // Geometry(Geometry,3857)
  no_lot: string;
  objectid: number;
  va_suprf_l: number;
  shape_area: number;
  // Ajoutez d'autres champs si nécessaires
}

export interface DbRoleFoncier {
  id_provinc: string;
  geog: string;  // geometry(Point,3857)
  value_land: number;
  value_building: number;
  value_total: number;
  addresses_text: string;
  code_utilisation: number;
  land_area_sq_m: number;
  building_levels: number;
  // Ajoutez d'autres champs si nécessaires
}

export interface DbIntersectionResult {
  nombre_points: number;
  valeur_totale: number;
  features: {
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
  }[];
}