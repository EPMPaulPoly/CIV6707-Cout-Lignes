CREATE TABLE transport.lot_point_relationship AS
SELECT 
    c.ogc_fid AS lot_id,
    r.id_provinc AS role_foncier_id
FROM cadastre.cadastre_quebec c
JOIN foncier.role_foncier r
    ON ST_Intersects(c.wkb_geometry, r.geog::geometry);