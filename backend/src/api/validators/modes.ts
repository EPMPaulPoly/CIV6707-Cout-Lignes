import { z } from 'zod';
import { validate } from './index';

const ModeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cost_per_km: z.number().min(0),
  cost_per_station: z.number().min(0),
  footprint: z.number().min(0),
});

export const validateMode = validate(ModeSchema);