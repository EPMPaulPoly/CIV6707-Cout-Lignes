import { Router } from 'express';
import { Pool } from 'pg';
import { DbTaxLot } from '../../types/database';

export const createTaxLotsRouter = (pool: Pool) => {
  const router = Router();

  // Get all tax lots
  router.get('/', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTaxLot>('SELECT * FROM tax_lots');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Get tax lots near a line
  router.get('/near-line/:lineId', async (req, res) => {
    try {
      const { lineId } = req.params;
      const client = await pool.connect();
      
      // Cette requête est un exemple - vous devrez l'adapter à votre structure exacte
      const result = await client.query<DbTaxLot>(`
        SELECT DISTINCT tl.*
        FROM tax_lots tl
        JOIN line_stops ls ON ls.line_id = $1
        JOIN transit_stops ts ON ls.stop_id = ts.id
        WHERE ST_DWithin(
          tl.polygon::geography,
          ST_MakePoint(ts.longitude, ts.latitude)::geography,
          300  -- distance en mètres
        )
      `, [lineId]);
      
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // Get a specific tax lot
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTaxLot>(
        'SELECT * FROM tax_lots WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Tax lot not found' });
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  return router;
};