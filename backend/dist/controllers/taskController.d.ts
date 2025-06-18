import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getTasks: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const assignTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map