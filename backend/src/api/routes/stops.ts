import { Router } from 'express';
import { Pool } from 'pg';
import { validateStop } from '../validators/stop';
import { DbTransitStop } from '../../types/database';

export const createStopsRouter = (pool: Pool) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>('SELECT * FROM transit_stops');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.post('/', validateStop, async (req, res) => {
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
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.put('/:id', validateStop, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, latitude, longitude } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbTransitStop>(
        'UPDATE transit_stops SET name = $1, latitude = $2, longitude = $3 WHERE id = $4 RETURNING *',
        [name, latitude, longitude, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Stop not found' });
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      
      // Vérifier si l'arrêt est utilisé dans une ligne
      const checkResult = await client.query(
        'SELECT * FROM line_stops WHERE stop_id = $1',
        [id]
      );
      
      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete stop that is used in transit lines'
        });
      }
      
      const result = await client.query(
        'DELETE FROM transit_stops WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Stop not found' });
      }
      
      res.json({ success: true });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  return router;
};