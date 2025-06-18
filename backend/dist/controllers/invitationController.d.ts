import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const sendTeamInvitation: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const acceptInvitation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getInvitationDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=invitationController.d.ts.map