import { Request, Response, NextFunction } from 'express';
import { JwtService, AsyncStorageService, logger } from '../services';

export const authenticateAndAttachUserContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  JwtService.verifyAccessToken(req, res, (authErr: any) => {
    if (authErr) {
      return next(authErr);
    }

    // @ts-ignore: Suppress TS error for non-existent property
    const payload = req.payload;

    if (
      payload &&
      typeof payload.aud === 'string' &&
      typeof payload.role === 'string'
    ) {
      const idNumber = payload.aud;
      const role = payload.role;
      const asyncStorage = AsyncStorageService.getInstance();
      const existingStore = asyncStorage.getStore();
      const newStore = existingStore ? new Map(existingStore) : new Map();

      asyncStorage.run(() => {
        asyncStorage.set('currentUser', { idNumber, role });
        next();
      }, newStore);
    } else {
      logger.warn(
        'Warning: Unable to attach user context, missing payload or audience field.',
      );
      next();
    }
  });
};
