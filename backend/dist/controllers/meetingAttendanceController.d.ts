import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const updateMeetingAttendance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMeetingAttendance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const joinMeeting: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const leaveMeeting: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=meetingAttendanceController.d.ts.map