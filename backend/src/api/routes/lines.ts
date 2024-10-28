import { Router } from 'express';
import { Pool } from 'pg';
import { validateLine } from '../validators/line';
import { DbTransitLine, DbLineStop } from '../../types/database';

export const createLinesRouter = (pool: Pool) => {
  const router = Router();

  // Get all lines
  router.get('/', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>('SELECT * FROM transit_lines');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Get a specific line
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'SELECT * FROM transit_lines WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Line not found' });
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Create a new line
  router.post('/', validateLine, async (req, res) => {
    try {
      const { name, description, mode } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitLine>(
        'INSERT INTO transit_lines (name, description, mode) VALUES ($1, $2, $3) RETURNING *',
        [name, description, mode]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Get route points for a line
  router.get('/:id/route-points', async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbLineStop>(
        `SELECT ls.*, ts.name as stop_name, ts.latitude, ts.longitude 
         FROM line_stops ls
         JOIN transit_stops ts ON ls.stop_id = ts.id
         WHERE ls.line_id = $1
         ORDER BY ls.order_of_stop`,
        [id]
      );
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Add route point to a line
  router.post('/:id/route-points', async (req, res) => {
    try {
      const { id } = req.params;
      const { stop_id, order_of_stop, is_station } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbLineStop>(
        'INSERT INTO line_stops (line_id, stop_id, order_of_stop, is_station) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, stop_id, order_of_stop, is_station]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  return router;
};