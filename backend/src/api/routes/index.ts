import { Router } from 'express';
import { Pool } from 'pg';
import { createStopsRouter } from './stops';
import { createLinesRouter } from './lines';
import { createModesRouter } from './modes';
import { createTaxLotsRouter } from './taxLots';
import { createCadastreRouter } from './cadastreRoutes';

export const createApiRouter = (pool: Pool) => {
  const router = Router();
  console.log('going through router')
  router.use('/stops', createStopsRouter(pool));
  router.use('/lines', createLinesRouter(pool));
  router.use('/modes', createModesRouter(pool));
  router.use('/tax-lots', createTaxLotsRouter(pool));
  router.use('/cadastre', createCadastreRouter(pool));

  return router;}