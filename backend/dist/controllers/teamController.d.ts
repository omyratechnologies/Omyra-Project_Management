import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getTeamMembers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeamMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTeamMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTeamMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=teamController.d.ts.map