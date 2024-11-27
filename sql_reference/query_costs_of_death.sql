WITH buffer_zone AS (
    SELECT 
        line_id,
        ST_Buffer(
            ST_Transform(geom, 3857),
            50,
            'quad_segs=5'
        ) AS buffer_geom
    FROM transport.transit_lines
),
intersecting_properties AS (
    SELECT 
        c.ogc_fid,
        r.value_total,
        ST_Intersection(c.wkb_geometry, r.geog::geometry) AS intersection_geom
    FROM cadastre.cadastre_quebec c
    JOIN foncier.role_foncier r
        ON ST_Intersects(c.wkb_geometry, r.geog::geometry)
    WHERE 
        c.wkb_geometry IS NOT NULL 
        AND r.geog IS NOT NULL
)
SELECT 
    COUNT(*) as parcels_within_buffer,
    SUM(p.value_total) as total_property_value
FROM intersecting_properties p
JOIN buffer_zone b
    ON ST_Intersects(p.intersection_geom, b.buffer_geom);
