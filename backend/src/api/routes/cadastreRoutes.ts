import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { validateGeometry } from '../validators/geometryValidator';
import { DbCadastre } from '../../types/database';
import { Polygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon;  
}

export const createCadastreRouter = (pool: Pool): Router => {
  const router = Router();

  const getCadastreInBounds: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { geometry } = req.body as GeometryBody;
      const client = await pool.connect();
      
      const query = `
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(wkb_geometry)::json,
              'properties', json_build_object(
                'ogc_fid', ogc_fid,
                'no_lot', no_lot,
                'va_suprf_l', va_suprf_l,
                'shape_area', shape_area
              )
            )
          )
        ) as geojson
        FROM cadastre.cadastre_montreal
        WHERE ST_Intersects(wkb_geometry, ST_GeomFromGeoJSON($1));
      `;

      const result = await client.query(query, [JSON.stringify(geometry)]);
      res.json({ success: true, data: result.rows[0].geojson });
      client.release();
    } catch (err) {
      console.error('Error in getCadastreInBounds:', err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  const getCadastreById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { ids } = req.body;
      console.log('Request Data:', { ids });
      const client = await pool.connect();
       // Using parameterized query with array
      const query = `
      SELECT
        cq.ogc_fid,
        COALESCE(SUM(rf.value_total), 0) AS value_total,
        ST_AsGeoJSON(ST_Transform(cq.wkb_geometry, 4326)) AS geojson_geometry
      FROM
        cadastre.cadastre_quebec cq
      JOIN
        transport.lot_point_relationship lpr 
        ON lpr.lot_id = cq.ogc_fid
      JOIN
        foncier.role_foncier rf 
        ON rf.id_provinc = lpr.role_foncier_id
      WHERE
        cq.ogc_fid = ANY($1::bigint[]) -- Use PostgreSQL array handling
      GROUP BY 
        cq.ogc_fid, cq.wkb_geometry;
    `;

      // Pass `ids` as a PostgreSQL array
      const result = await client.query(query, [ids]); // Note: `ids` must be an array
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      console.error('Error in getCadastreInBounds:', err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Route simplifiée
  router.post('/bounds', validateGeometry, getCadastreInBounds);
  router.post('/ids',getCadastreById);
  return router;
};