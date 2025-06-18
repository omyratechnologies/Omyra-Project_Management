import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getCompanySettings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCompanySettings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=companyController.d.ts.map