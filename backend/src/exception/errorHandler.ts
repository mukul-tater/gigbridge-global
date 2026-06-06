import type { NextFunction, Request, Response } from 'express';
import { AppException } from './AppException.js';
import type { ApiErrorResponseDto } from '../dto/WorkerDto.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppException) {
    const body: ApiErrorResponseDto = {
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error('Unhandled error:', err);
  const body: ApiErrorResponseDto = {
    success: false,
    message: 'Internal server error',
  };
  res.status(500).json(body);
}
