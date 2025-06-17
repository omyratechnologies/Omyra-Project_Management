import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { errorResponse } from '../utils/response.js';
import { UserRole } from '../types/index.js';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Access denied. Insufficient permissions.', undefined, 403);
      return;
    }

    next();
  };
};

export const isAdmin = authorize('admin');
export const isAdminOrProjectManager = authorize('admin', 'project_manager');
