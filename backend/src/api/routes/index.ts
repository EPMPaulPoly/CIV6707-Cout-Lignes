import { Router } from 'express';
import { Pool } from 'pg';
import { createStopsRouter } from './stops';
import { createLinesRouter } from './lines';
import { createModesRouter } from './modes';
import { createTaxLotsRouter } from './taxLots';

export const createApiRouter = (pool: Pool) => {
  const router = Router();
  console.log('going through router')
  router.use('/stops', createStopsRouter(pool));
  router.use('/lines', createLinesRouter(pool));
  router.use('/modes', createModesRouter(pool));
  router.use('/tax-lots', createTaxLotsRouter(pool));

  return router;}