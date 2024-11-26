import { Router, Request, Response, RequestHandler, NextFunction } from 'express';
import { Pool } from 'pg';
import { validateGeometry } from '../validators/geometryValidator';
import { DbRoleFoncier } from '../../types/database';

interface GeometryBody {
  geometry: GeoJSON.Polygon;
}

export const createRoleFoncierRouter = (pool: Pool): Router => {
  const router = Router();

  const getRoleFoncierInBounds: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { geometry } = req.body as GeometryBody;
      const client = await pool.connect();
      
      const query = `
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geog)::json,
              'properties', json_build_object(
                'id_provinc', id_provinc,
                'value_total', value_total,
                'addresses_text', addresses_text,
                'code_utilisation', code_utilisation,
                'land_area_sq_m', land_area_sq_m,
                'building_levels', building_levels
              )
            )
          )
        ) as geojson
        FROM foncier.role_foncier_montreal
        WHERE ST_Intersects(geog, ST_GeomFromGeoJSON($1))
        AND is_ignored = false
        AND is_in_od_montreal = true;
      `;

      const result = await client.query(query, [JSON.stringify(geometry)]);
      res.json({ success: true, data: result.rows[0].geojson });
      client.release();
    } catch (err) {
      console.error('Error in getRoleFoncierInBounds:', err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Routes
  router.post('/bounds', validateGeometry, getRoleFoncierInBounds);

  return router;
};