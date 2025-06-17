import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils';
import { AsyncStorageService } from '../services';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const asyncStorage = AsyncStorageService.getInstance();
    const currUser = asyncStorage.get('currentUser');
    const role = currUser?.role;

    if (!role || !allowedRoles.includes(role)) {
      const error = new ErrorResponse(
        'FORBIDDEN',
        'You are not supposed to be here.',
      );
      res.status(403).json({ success: false, error });
      return;
    }

    next();
  };
};
