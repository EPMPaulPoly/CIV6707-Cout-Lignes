import { RequestHandler } from 'express';

interface LineRequest {
  name: string;
  description: string;
  mode: string;
}

export const validateLine: RequestHandler<{}, any, LineRequest> = (req, res, next): void => {
  const { name, description, mode } = req.body;

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

  if (!mode || typeof mode !== 'string' || mode.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Mode is required and must be a non-empty string'
    });
    return;
  }

  next();
};