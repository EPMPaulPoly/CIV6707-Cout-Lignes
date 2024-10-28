import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { validateMode } from '../validators/modes';
import { DbTransportMode } from '../../types/database';
import { ParamsDictionary } from 'express-serve-static-core';

interface TransportModeRequest {
  name: string;
  cost_per_km: number;
  cost_per_station: number;
  footprint: number;
}

// Étendre ParamsDictionary au lieu de créer une nouvelle interface
interface ModeParams extends ParamsDictionary {
  id: string;
}

export const createModesRouter = (pool: Pool): Router => {
  const router = Router();

  // Get all transport modes
  const getAllModes: RequestHandler = async (_req, res, next) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>('SELECT * FROM transport_modes');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Get a specific transport mode
  const getMode: RequestHandler<ModeParams> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>(
        'SELECT * FROM transport_modes WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Mode not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Create a new transport mode
  const createMode: RequestHandler<{}, any, TransportModeRequest> = async (req, res, next) => {
    try {
      const { name, cost_per_km, cost_per_station, footprint } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>(
        'INSERT INTO transport_modes (name, cost_per_km, cost_per_station, footprint) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, cost_per_km, cost_per_station, footprint]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Update a transport mode
  const updateMode: RequestHandler<ModeParams, any, TransportModeRequest> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, cost_per_km, cost_per_station, footprint } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>(
        'UPDATE transport_modes SET name = $1, cost_per_km = $2, cost_per_station = $3, footprint = $4 WHERE id = $5 RETURNING *',
        [name, cost_per_km, cost_per_station, footprint, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Mode not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };

  // Validator middleware avec le bon type de paramètres
  const validatorMiddleware: RequestHandler<ParamsDictionary, any, TransportModeRequest> = (req, res, next) => {
    const { name, cost_per_km, cost_per_station, footprint } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Invalid name' });
      return;
    }

    if (!cost_per_km || typeof cost_per_km !== 'number' || cost_per_km < 0) {
      res.status(400).json({ success: false, error: 'Invalid cost per kilometer' });
      return;
    }

    if (!cost_per_station || typeof cost_per_station !== 'number' || cost_per_station < 0) {
      res.status(400).json({ success: false, error: 'Invalid cost per station' });
      return;
    }

    if (!footprint || typeof footprint !== 'number' || footprint < 0) {
      res.status(400).json({ success: false, error: 'Invalid environmental footprint' });
      return;
    }

    next();
  };

  // Routes
  router.get('/', getAllModes);
  router.get('/:id', getMode);
  router.post('/', validatorMiddleware, createMode);
  router.put('/:id', validatorMiddleware, updateMode);

  return router;
};