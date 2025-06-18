import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createMeeting: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMeetings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMeetingById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMeeting: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMeeting: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUpcomingMeetings: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMeetingLink: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=meetingController.d.ts.map