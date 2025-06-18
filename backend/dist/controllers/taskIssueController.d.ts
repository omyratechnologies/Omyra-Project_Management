import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createTaskIssue: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTaskIssues: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateTaskIssue: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTaskIssue: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteTaskIssue: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=taskIssueController.d.ts.map