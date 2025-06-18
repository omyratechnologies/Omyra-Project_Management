import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { errorResponse } from '../utils/response.js';
import { AuthPayload } from '../types/index.js';
import { config } from '../config/environment.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In production, don't reveal specific error details
      const message = config.nodeEnv === 'production' 
        ? 'Authentication required' 
        : 'Access denied. No token provided.';
      errorResponse(res, message, undefined, 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      // In production, log the actual error but don't expose it to client
      if (config.nodeEnv === 'production') {
        console.error('Token verification failed:', error);
      }
      
      const message = config.nodeEnv === 'production' 
        ? 'Authentication failed' 
        : 'Invalid token.';
      errorResponse(res, message, undefined, 401);
      return;
    }
  } catch (error) {
    // Log error in production for debugging
    if (config.nodeEnv === 'production') {
      console.error('Authentication middleware error:', error);
    }
    
    const message = config.nodeEnv === 'production' 
      ? 'Internal server error' 
      : 'Authentication error.';
    errorResponse(res, message, undefined, 500);
    return;
  }
};
