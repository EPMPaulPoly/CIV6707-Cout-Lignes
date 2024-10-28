import { z } from 'zod';
import { validate } from './index';

const StopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const validateStop = validate(StopSchema);
