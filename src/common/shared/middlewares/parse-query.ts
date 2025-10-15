import { Request, Response, NextFunction } from 'express';

export const parseQueryMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (typeof req.query.query === 'string') {
    try {
      req.query.query = JSON.parse(req.query.query);
    } catch (e) {
      req.query.query = {};
    }
  }

  next();
};
