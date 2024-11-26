import { Request, Response, NextFunction } from 'express';

export const validateGeometry = (req: Request, res: Response, next: NextFunction): void => {
  const { geometry } = req.body;

  if (!geometry) {
    res.status(400).json({ success: false, error: 'Geometry is required' });
    return;
  }

  if (geometry.type !== 'Polygon') {
    res.status(400).json({ success: false, error: 'Geometry must be a Polygon' });
    return;
  }

  if (!Array.isArray(geometry.coordinates) || !Array.isArray(geometry.coordinates[0])) {
    res.status(400).json({ success: false, error: 'Invalid coordinates format' });
    return;
  }

  // Vérifier que les coordonnées sont dans la plage valide pour EPSG:3857
  try {
    const isValidCoordinate = (coord: number[]) => {
      const [x, y] = coord;
      return (
        typeof x === 'number' && 
        typeof y === 'number' &&
        x >= -20026376.39 && 
        x <= 20026376.39 &&
        y >= -20048966.10 && 
        y <= 20048966.10
      );
    };

    const allCoordinatesValid = geometry.coordinates[0].every(isValidCoordinate);
    if (!allCoordinatesValid) {
      res.status(400).json({ success: false, error: 'Coordinates out of valid range for EPSG:3857' });
      return;
    }

    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid geometry format' });
    return;
  }
};