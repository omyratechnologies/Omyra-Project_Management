import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const register: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePreferences: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPreferences: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requestPasswordReset: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map