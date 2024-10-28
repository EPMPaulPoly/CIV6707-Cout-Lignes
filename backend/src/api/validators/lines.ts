import { z } from 'zod';
import { validate } from './index';

const LineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  mode: z.string().min(1, 'Mode is required'),
});

export const validateLine = validate(LineSchema);