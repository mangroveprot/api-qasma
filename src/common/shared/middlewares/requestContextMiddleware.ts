import { Request, Response, NextFunction } from 'express';
import { AsyncStorageService } from '../services';

/**
 * Request Context Middleware
 *
 * Creates an async context for the request and captures request metadata
 * (IP, device, userAgent, etc.) into AsyncStorage so that services
 * (e.g. ActivityLogService) can read it when saving logs.
 *
 * Must use .run() so that AsyncLocalStorage has a store; otherwise
 * .set() is a no-op and getRequestMetadata() returns null in services.
 */
export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const asyncStorage = AsyncStorageService.getInstance();

  const metadata = {
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      null,
    userAgent: (req.headers['user-agent'] as string) || null,
    device: (req.headers['x-device-name'] as string) || null,
    platform:
      (req.headers['x-platform'] as string) ||
      (req.headers['x-os'] as string) ||
      null,
    appVersion: (req.headers['x-app-version'] as string) || null,
  };

  asyncStorage.run(() => {
    try {
      asyncStorage.set('requestMetadata', metadata);
    } catch (error) {
      console.error('Failed to capture request metadata:', error);
    }
    next();
  }, new Map());
};
