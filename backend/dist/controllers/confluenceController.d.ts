import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createConfluencePage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getConfluencePages: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getConfluencePage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateConfluencePage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteConfluencePage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPageVersions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=confluenceController.d.ts.map