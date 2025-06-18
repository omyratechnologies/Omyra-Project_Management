import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const registerClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getClients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const approveClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deactivateClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyClientProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=clientController.d.ts.map