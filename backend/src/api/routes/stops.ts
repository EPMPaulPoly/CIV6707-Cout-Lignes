import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { validateStop } from '../validators/stops';
import { DbTransitStop } from '../../types/database';
import { ParamsDictionary } from 'express-serve-static-core';

interface StopRequest {
  name: string;
  latitude: number;
  longitude: number;
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
      const result = await client.query<DbTransitStop>('SELECT * FROM transit_stops');
      res.json({ success: true, data: result.rows });
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
        'SELECT * FROM transit_stops WHERE id = $1',
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
      const { name, latitude, longitude } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        'INSERT INTO transit_stops (name, latitude, longitude, is_complete) VALUES ($1, $2, $3, true) RETURNING *',
        [name, latitude, longitude]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Update a stop
  const updateStop: RequestHandler<StopParams, any, StopRequest> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, latitude, longitude } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        'UPDATE transit_stops SET name = $1, latitude = $2, longitude = $3 WHERE id = $4 RETURNING *',
        [name, latitude, longitude, id]
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
        'SELECT * FROM line_stops WHERE stop_id = $1',
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
        'DELETE FROM transit_stops WHERE id = $1 RETURNING *',
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
    const { name, latitude, longitude } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Invalid name' });
      return;
    }

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      res.status(400).json({ success: false, error: 'Invalid latitude' });
      return;
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      res.status(400).json({ success: false, error: 'Invalid longitude' });
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