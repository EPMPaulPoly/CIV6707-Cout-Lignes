import { Router, Request, Response, RequestHandler, NextFunction } from 'express';
import { Pool } from 'pg';
import { validateGeometry } from '../validators/geometryValidator';
import { DbIntersectionResult } from '../../types/database';

interface GeometryBody {
  geometry: GeoJSON.Polygon;
}

export const createIntersectionRouter = (pool: Pool): Router => {
  const router = Router();

  const getIntersections: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { geometry } = req.body as GeometryBody;
      const client = await pool.connect();
      
      const query = `
        WITH intersections AS (
          SELECT 
            COUNT(DISTINCT rf.id_provinc) as nombre_points,
            SUM(rf.value_total) as valeur_totale,
            json_agg(
              json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Intersection(c.wkb_geometry, rf.geog))::json,
                'properties', json_build_object(
                  'value_total', rf.value_total,
                  'no_lot', c.no_lot,
                  'addresses_text', rf.addresses_text
                )
              )
            ) as features
          FROM cadastre.cadastre_montreal c
          JOIN foncier.role_foncier_montreal rf 
          ON ST_Intersects(c.wkb_geometry, rf.geog)
          WHERE ST_Intersects(c.wkb_geometry, ST_GeomFromGeoJSON($1))
        )
        SELECT 
          COALESCE(nombre_points, 0) as nombre_points,
          COALESCE(valeur_totale, 0) as valeur_totale,
          COALESCE(features, '[]'::json) as features
        FROM intersections;
      `;

      const result = await client.query<DbIntersectionResult>(query, [JSON.stringify(geometry)]);
      
      res.json({ 
        success: true, 
        data: result.rows[0] 
      });
      
      client.release();
    } catch (err) {
      console.error('Error in getIntersections:', err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Routes
  router.post('/', validateGeometry, getIntersections);

  return router;
};