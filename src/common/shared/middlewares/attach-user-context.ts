import { Request, Response, NextFunction } from 'express';
import { AsyncStorageService, logger } from '../services';

export const attachUserToContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const asyncStorage = AsyncStorageService.getInstance();

  // @ts-ignore
  const payload = req.payload as { aud?: string; role?: string } | undefined;

  const idNumber = payload?.aud || req.body.idNumber;
  const role = payload?.role || req.body.role;

  if (idNumber && role) {
    const existingStore = asyncStorage.getStore();
    const newStore = existingStore ? new Map(existingStore) : new Map();
    asyncStorage.run(() => {
      asyncStorage.set('currentUser', { idNumber, role });
      next();
    }, newStore);
  } else {
    logger.warn(
      'Warning: Unable to attach user context, missing idNumber or role.',
    );
    next();
  }
};
