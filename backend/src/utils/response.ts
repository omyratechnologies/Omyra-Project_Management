import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 400
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};

export const validationErrorResponse = (
  res: Response,
  errors: any[]
): Response<ApiResponse> => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    error: errors
  });
};
