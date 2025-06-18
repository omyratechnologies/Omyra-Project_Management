import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getProjects: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProject: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createProject: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProject: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProject: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addProjectMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const removeProjectMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProjectStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map