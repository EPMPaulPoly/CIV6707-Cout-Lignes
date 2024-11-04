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

interface DeleteResponse {
  success: boolean;
  data?: DbTransportMode | null;
  error?: string | null;
  deletedRows?: number | null;
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
      const result = await client.query<DbTransportMode>('SELECT * FROM lignes_transport.transport_modes');
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
        'SELECT * FROM lignes_transport.transport_modes WHERE id = $1',
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
        'INSERT INTO lignes_transport.transport_modes (name, cost_per_km, cost_per_station, footprint) VALUES ($1, $2, $3, $4) RETURNING *',
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
        'UPDATE lignes_transport.transport_modes SET name = $1, cost_per_km = $2, cost_per_station = $3, footprint = $4 WHERE mode_id = $5 RETURNING *',
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

  const deleteMode: RequestHandler<
    ModeParams,
    DeleteResponse,
    TransportModeRequest
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

      const result = await client.query<DbTransportMode>(
        'DELETE FROM lignes_transport.transport_modes WHERE mode_id=$1 RETURNING *',
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
  router.delete('/:id', deleteMode)

  return router;
};