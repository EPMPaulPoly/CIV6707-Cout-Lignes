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

  // Route simplifiée
  router.post('/bounds', validateGeometry, getCadastreInBounds);

  return router;
};