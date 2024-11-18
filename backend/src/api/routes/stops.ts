import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { validateStop } from '../validators/stops';
import { DbTransitStop } from '../../types/database';
import { ParamsDictionary } from 'express-serve-static-core';

interface StopRequest {
  name: string;
  is_station: boolean;
  position: {
    x: number;
    y: number;
  };
}

interface StopParams extends ParamsDictionary {
  id: string;
}

export const createStopsRouter = (pool: Pool): Router => {
  const router = Router();

  // Get all stops
  const getAllStops: RequestHandler = async (_req, res, next) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>( `SELECT id, name, is_station, ST_X(geom) as x, ST_Y(geom) as y FROM transport.transit_stops` );
      res.json({ success: true, data: result.rows.map(row => ({...row, position: { x: row.x, y: row.y }}))});
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Get a specific stop
  const getStop: RequestHandler<StopParams> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        `SELECT id, name, is_station, ST_X(geom) as x, ST_Y(geom) as y FROM transport.transit_stops WHERE id = $1`, 
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Stop not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Create a new stop
  const createStop: RequestHandler<{}, any, StopRequest> = async (req, res, next) => {
    try {
      const { name, is_station, position } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        `INSERT INTO transport.transit_stops (name, is_station, geom) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 3857)) 
        RETURNING *, ST_X(geom) as x, ST_Y(geom) as y`,
        [name, is_station, position.x, position.y]
      );
      res.status(201).json({ success: true, data: {...result.rows[0], position: { x: result.rows[0].x, y: result.rows[0].y }}});
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Update a stop
  const updateStop: RequestHandler<StopParams, any, StopRequest> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, is_station, position } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        `UPDATE transport.transit_stops SET name = $1, is_station = $2, geom = ST_SetSRID(ST_MakePoint($3, $4), 3857) WHERE id = $5 
        RETURNING *, ST_X(geom) as x, ST_Y(geom) as y`,
        [name, is_station, position.x, position.y, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Stop not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Delete a stop
  const deleteStop: RequestHandler<StopParams> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      
      // Vérifier si l'arrêt est utilisé dans une ligne
      const checkResult = await client.query(
        'SELECT * FROM transport.line_stops WHERE stop_id = $1',
        [id]
      );
      
      if (checkResult.rows.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete stop that is used in transit lines'
        });
        return;
      }
      
      const result = await client.query(
        'DELETE FROM transport.transit_stops WHERE stop_id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Stop not found' });
        return;
      }
      
      res.json({ success: true });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Validator middleware
  const validatorMiddleware: RequestHandler<ParamsDictionary, any, StopRequest> = (req, res, next) => {
    const { name, is_station, position } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Invalid name' });
      return;
    }

    if (typeof is_station !== 'boolean' ) {
      res.status(400).json({ success: false, error: 'Invalid is_station' });
      return;
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      res.status(400).json({ success: false, error: 'Invalid position coordinates' });
      return;
    }

    next();
  };

  // Routes
  router.get('/', getAllStops);
  router.get('/:id', getStop);
  router.post('/', validatorMiddleware, createStop);
  router.put('/:id', validatorMiddleware, updateStop);
  router.delete('/:id', deleteStop);

  return router;
};