import { Request, Response, NextFunction } from 'express';
import ErrorResponse from './response';
import { ApiResponse } from '../response';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ErrorResponse) {
    ApiResponse.error(res, { success: false, error: err });
    return;
  }

  const genericError = new ErrorResponse(
    'GENERAL_ERROR',
    err.message || 'An unexpected error occured',
    [],
  );

  ApiResponse.error(res, {
    success: false,
    error: genericError,
    stack: err.stack,
  } as any);
  return;
};

export default errorHandler;
