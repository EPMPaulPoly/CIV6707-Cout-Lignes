import { RequestHandler } from 'express';

interface LineRequest {
  name: string;
  description: string;
  mode_id: number;
}

export const validateLine: RequestHandler<{}, any, LineRequest> = (req, res, next): void => {
  const { name, description, mode_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Name is required and must be a non-empty string'
    });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Description is required and must be a non-empty string'
    });
    return;
  }

  if (!mode_id || typeof mode_id !== 'number' || mode_id<= 0) {
    res.status(400).json({
      success: false,
      error: 'Mode is required and must be a non-empty string'
    });
    return;
  }

  next();
};