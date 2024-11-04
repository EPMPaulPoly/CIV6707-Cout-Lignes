import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTaxLot } from '../../types/database';
import { ParamsDictionary } from 'express-serve-static-core';

interface TaxLotParams extends ParamsDictionary {
  id: string;
}

interface LineParams extends ParamsDictionary {
  lineId: string;
}

export const createTaxLotsRouter = (pool: Pool): Router => {
  const router = Router();

  // Get all tax lots
  const getAllTaxLots: RequestHandler = async (_req, res, next) => {
    try {
      const client = await pool.connect();
      const result = await client.query<DbTaxLot>('SELECT * FROM lignes_transport.tax_lots');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Get tax lots near a line
  const getTaxLotsNearLine: RequestHandler<LineParams> = async (req, res, next) => {
    try {
      const { lineId } = req.params;
      const client = await pool.connect();
      
      const result = await client.query<DbTaxLot>(`
        SELECT DISTINCT tl.*
        FROM lignes_transport.tax_lots tl
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
  };

  // Get a specific tax lot
  const getTaxLot: RequestHandler<TaxLotParams> = async (req, res, next) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      const result = await client.query<DbTaxLot>(
        'SELECT * FROM tax_lots WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Tax lot not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  // Routes
  router.get('/', getAllTaxLots);
  router.get('/near-line/:lineId', getTaxLotsNearLine);
  router.get('/:id', getTaxLot);

  return router;
};