import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { validateLine } from '../validators/lines';
import { DbTransitLine, DbLineStop } from '../../types/database';

// Types pour les requêtes
interface CreateLineRequest {
  name: string;
  description: string;
  mode_id: number;
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
interface LineParams {
  id: string;
}

export const createLinesRouter = (pool: Pool):Router => {
  const router = Router();

  // Get all lines
  // Get all lines
  const getAllLines: RequestHandler = async (_req, res):Promise<void> => {
    console.log('entering get all lines query')
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>('SELECT * FROM lignes_transport.transit_lines');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Get a specific line
  const getLine: RequestHandler<LineParams> = async (req, res):Promise<void> => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'SELECT * FROM lignes_transport.transit_lines WHERE id = $1',
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
  const createLine: RequestHandler<{}, any, CreateLineRequest> = async (req, res):Promise<void> => {
    try {
      console.log('Trying to create line')
      const { name, description, mode_id } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'INSERT INTO lignes_transport.transit_lines (name, description, mode_id) VALUES ($1, $2, $3) RETURNING *',
        [name, description, mode_id]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

 // Get route points for a line
const getAllRoutePoints: RequestHandler = async (req, res):Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query<RoutePointResponse>(
      `SELECT * FROM lignes_transport.line_stops`,
    );
    res.json({ success: true, data: result.rows });
    client.release();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

const getRoutePoints: RequestHandler<LineParams> = async (req, res):Promise<void> => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query<RoutePointResponse>(
      `SELECT * FROM lignes_transport.line_stops WHERE stop_id = $1`,
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
    const { stop_id, order_of_stop, is_station } = req.body;
    const client = await pool.connect();
    const result = await client.query<DbLineStop>(
      'INSERT INTO lignes_transport.line_stops (line_id, stop_id, order_of_stop, is_station) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, stop_id, order_of_stop, is_station]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
    client.release();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};
  // Routes
  router.get('/', getAllLines);
  router.get('/route-points',getAllRoutePoints);
  router.get('/:id', getLine);
  console.log('getting to here')
  router.post('/', validateLine, createLine);
  router.get('/:id/route-points', getRoutePoints);
  router.post('/:id/route-points', addRoutePoint);

  return router;
};