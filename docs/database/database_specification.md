# Structure de la base de données 

Le diagramme d'entité relation simplifié ci-dessous explique les principaux champs utiles pour le calcul des coûts d'infrastructure:
```mermaid
---
title: Transit cost estimation
---
erDiagram
    transit_modes ||--o{ transit_lines : mode_id
    transit_lines {
        int line_id PK
        string name
        string description
        int mode_id FK
        string color
        geom geom
        geom buffer_geom
    }
    transit_modes{
      int mode_id PK
      string name
      double cost_per_km
      double cost_per_station
      double footprint
    }
    transit_stops{
      int stop_id PK
      string name
      bool is_station
      geom geom
    }
    line_stops{
      int assoc_id PK
      int line_id FK
      int stop_id FK
      int order_of_stop
    }
    transit_lines ||--o{ line_stops : line_id
    transit_stops ||--o{ line_stops : stop_id
    role_foncier{
      string id_provinc PK
      double value_total
      geom wkb_geometry  
    }
    cadastre{
      string ogc_fid PK
      geom wkb_geometry
    }
    lot_point_relationship{
      string ogc_fid FK
      string id_provinc FK
    }
    role_foncier ||--o{ lot_point_relationship: id_provinc
    cadastre ||--o{ lot_point_relationship: ogc_fid 
    transit_lines||--o{ cadastre: intersect
```
Les sections suivantes détailleront les champs de la base de données, ainsi que certains modifications en termes de clés, de fonctions déclenchées qui doivent être mises en place pour que la géométrie des lignes et des zones tampons des lignes soient mises à jour avec les modifications sur les champs qui affecte le tracé et les zones tampons.
