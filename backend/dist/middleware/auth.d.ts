import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../types/index.js';
export interface AuthenticatedRequest extends Request {
    user?: AuthPayload;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map