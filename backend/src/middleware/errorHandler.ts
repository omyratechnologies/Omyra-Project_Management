import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message
    }));
    errorResponse(res, 'Validation failed', JSON.stringify(errors), 400);
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse(res, `${field} already exists`, undefined, 400);
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    errorResponse(res, 'Invalid ID format', undefined, 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', undefined, 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token expired', undefined, 401);
    return;
  }

  // Default error
  errorResponse(
    res,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : undefined,
    500
  );
};
