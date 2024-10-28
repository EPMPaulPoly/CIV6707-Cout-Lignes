import { Router } from 'express';
import { Pool } from 'pg';
import { validateMode } from '../validators/modes';
import { DbTransportMode } from '../../types/database';

export const createModesRouter = (pool: Pool) => {
  const router = Router();

  // Get all transport modes
  router.get('/', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>('SELECT * FROM transport_modes');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Get a specific transport mode
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>(
        'SELECT * FROM transport_modes WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Mode not found' });
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Create a new transport mode
  router.post('/', validateMode, async (req, res) => {
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
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Update a transport mode
  router.put('/:id', validateMode, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, cost_per_km, cost_per_station, footprint } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransportMode>(
        'UPDATE transport_modes SET name = $1, cost_per_km = $2, cost_per_station = $3, footprint = $4 WHERE id = $5 RETURNING *',
        [name, cost_per_km, cost_per_station, footprint, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Mode not found' });
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  return router;
};