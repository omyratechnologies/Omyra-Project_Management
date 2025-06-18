import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createClientFeedback: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProjectFeedback: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateClientFeedback: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getClientFeedback: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteClientFeedback: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=clientFeedbackController.d.ts.map