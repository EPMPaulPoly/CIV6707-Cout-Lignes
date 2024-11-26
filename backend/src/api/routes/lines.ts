import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { validateLine } from '../validators/lines';
import { DbTransitLine, DbLineStop } from '../../types/database';
import { ParamsDictionary } from 'express-serve-static-core';

// Types pour les requêtes
interface CreateLineRequest {
  name: string;
  description: string;
  mode_id: number;
  color: string;
}

interface DeleteResponse {
  success: boolean;
  data?: DbTransitLine | null;
  error?: string | null;
  deletedRows?: number | null;
}

interface AddRoutePointRequest {
  stop_id: number;
  order_of_stop: number;
  is_station: boolean;
}

interface RoutePointResponse extends DbLineStop {
  stop_name: string;
  latitude: number;
  longitude: number;
}
interface LineParams extends ParamsDictionary {
  id: string;
}

interface RoutePointParams extends ParamsDictionary {
  id: string;
  lsid: string;
}

export const createLinesRouter = (pool: Pool): Router => {
  const router = Router();

  // Get all lines
  // Get all lines
  const getAllLines: RequestHandler = async (_req, res): Promise<void> => {
    console.log('entering get all lines query')
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>('SELECT * FROM transport.transit_lines');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Get a specific line
  const getLine: RequestHandler<LineParams> = async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'SELECT * FROM transport.transit_lines WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Line not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Create a new line
  const createLine: RequestHandler<{}, any, CreateLineRequest> = async (req, res): Promise<void> => {
    try {
      console.log('Trying to create line')
      const { name, description, mode_id, color } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'INSERT INTO transport.transit_lines (name, description, mode_id,color) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, mode_id, color]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });

    }
  };

  const updateLine: RequestHandler<LineParams, any, CreateLineRequest> = async (req, res, next): Promise<void> => {
    try {
      console.log('Trying to create line')
      const { id } = req.params;
      const { name, description, mode_id, color } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'UPDATE transport.transit_lines SET name=$1, description=$2, mode_id=$3,color=$4 WHERE line_id = $5 RETURNING *',
        [name, description, mode_id, color, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Mode not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      next(err);
    }
  };

  // Get route points for a line
  const getAllRoutePoints: RequestHandler = async (req, res): Promise<void> => {
    try {
      const client = await pool.connect();
      const result = await client.query<RoutePointResponse>(
        `SELECT * FROM transport.line_stops`,
      );
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  const getRoutePoints: RequestHandler<LineParams> = async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<RoutePointResponse>(
        `SELECT * FROM transport.line_stops WHERE stop_id = $1`,
        [id]
      );
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };
  // Add route point to a line
  const addRoutePoint: RequestHandler<LineParams, any, AddRoutePointRequest> = async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { stop_id, order_of_stop } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbLineStop>(
        'INSERT INTO transport.line_stops (line_id, stop_id, order_of_stop) VALUES ($1, $2, $3) RETURNING *',
        [id, stop_id, order_of_stop]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };
  const updateRoutePoints: RequestHandler = async (req, res): Promise<void> => {
    try {
      const updates: DbLineStop[] = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid update data format'
        });
        return;
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        const cases = updates.map((_, index) => ({
          stopId: `$${index * 4 + 1}::integer`,
          orderOfStop: `$${index * 4 + 2}::integer`,
          lineId: `$${index * 4 + 3}::integer`,
          assocId: `$${index * 4 + 4}::integer`
        }));

        const sql = `
          UPDATE transport.line_stops AS ls
          SET 
            stop_id = CASE assoc_id 
              ${cases.map((c, i) => `WHEN ${c.assocId} THEN ${c.stopId}`).join('\n            ')}
            END,
            order_of_stop = CASE assoc_id 
              ${cases.map((c, i) => `WHEN ${c.assocId} THEN ${c.orderOfStop}`).join('\n            ')}
            END,
            line_id = CASE assoc_id 
              ${cases.map((c, i) => `WHEN ${c.assocId} THEN ${c.lineId}`).join('\n            ')}
            END
          WHERE assoc_id IN (${cases.map(c => c.assocId).join(', ')})
          RETURNING *;
        `;

        // Create array of parameters in the correct order
        const params = updates.flatMap(u => [
          u.stop_id,
          u.order_of_stop,
          u.line_id,
          u.assoc_id
        ]);

        const result = await client.query<DbLineStop>(sql, params);
        await client.query('COMMIT');

        res.json({
          success: true,
          data: result.rows
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error updating route points:', err);
      res.status(500).json({
        success: false,
        error: 'Database error'
      });
    }
  };

  const deleteLine: RequestHandler<
    LineParams,
    DeleteResponse
  > = async (req, res, next): Promise<void> => {  // Explicit Promise<void> return type
    let client;

    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'Invalid mode ID provided'
        });
        return;  // Don't return the Response object
      }

      client = await pool.connect();

      const result = await client.query<DbTransitLine>(
        'DELETE FROM transport.transit_lines WHERE line_id=$1 RETURNING *',
        [id]
      );

      if (result.rowCount === 0 || result.command !== 'DELETE') {
        res.status(404).json({
          success: false,
          error: 'Mode not found or deletion failed'
        });
        return;  // Don't return the Response object
      }

      res.json({
        success: true,
        data: result.rows[0],
        deletedRows: result.rowCount
      });
      return;  // Don't return the Response object
    } catch (err) {
      if (client) {
        await client.query('ROLLBACK');
      }

      if (err instanceof Error) {
        if ('code' in err) {
          switch (err.code) {
            case '23503': // Foreign key violation
              res.status(409).json({
                success: false,
                error: 'Cannot delete mode as it is referenced by other records'
              });
              return;
            default:
              res.status(500).json({
                success: false,
                error: 'Database error occurred'
              });
              return;
          }
        }
      }
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  };
  const deleteRoutePoint: RequestHandler<RoutePointParams> = async (req, res): Promise<void> => {
    let client;

    try {
      const { id, lsid } = req.params;

      if (!id || !lsid || isNaN(Number(id)) || isNaN(Number(lsid))) {
        res.status(400).json({
          success: false,
          error: 'Invalid line ID or stop ID provided'
        });
        return;
      }

      client = await pool.connect();
      
      // Start transaction
      await client.query('BEGIN');

      // Delete the route point
      const result = await client.query<DbLineStop>(
        'DELETE FROM transport.line_stops WHERE line_id=$1 AND assoc_id=$2 RETURNING *',
        [id, lsid]
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({
          success: false,
          error: 'Route point not found'
        });
        return;
      }

      // Update the order_of_stop for remaining stops
      await client.query(
        `UPDATE transport.line_stops 
         SET order_of_stop = order_of_stop - 1 
         WHERE line_id = $1 
         AND order_of_stop > $2`,
        [id, result.rows[0].order_of_stop]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        data: result.rows[0],
      });

    } catch (err) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Error deleting route point:', err);
      res.status(500).json({
        success: false,
        error: 'Database error'
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  };
  const getLineCosts : RequestHandler = async(_req,res):Promise<void>=>{
    try {
      const client = await pool.connect();
      console.log('to be implemented')
      const result = await client.query<DbTransitLine>('SELECT b.line_id,COUNT(DISTINCT l.lot_id) AS parcels_within_buffer,SUM(r.value_total) AS total_property_value FROM transport.transit_lines b JOIN cadastre.cadastre_quebec c ON ST_Intersects(b.buffer_geom, c.wkb_geometry) JOIN transport.lot_point_relationship l ON l.lot_id = c.ogc_fid JOIN foncier.role_foncier r ON l.role_foncier_id = r.id_provinc GROUP BY b.line_id;'
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'cost feature not yet implemented' });
    }
  };
  // Routes
  router.get('/', getAllLines);
  router.get('/route-points', getAllRoutePoints);
  router.get('/costs',getLineCosts)
  router.get('/:id', getLine);
  router.put('/:id', validateLine, updateLine)
  router.delete('/:id', deleteLine);
  router.post('/', validateLine, createLine);
  router.get('/:id/route-points', getRoutePoints);
  router.post('/:id/route-points', addRoutePoint);
  router.put('/:id/route-points', updateRoutePoints);
  router.delete('/:id/route-points/:lsid', deleteRoutePoint);
  
  return router;
};