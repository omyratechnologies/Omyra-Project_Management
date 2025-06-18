import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isNotClient } from '../middleware/rbac.js';
import { updateMeetingAttendance, getMeetingAttendance, joinMeeting, leaveMeeting } from '../controllers/meetingAttendanceController.js';
const router = Router();
// Update meeting attendance status
router.put('/meetings/:meetingId/attendance', authenticate, updateMeetingAttendance);
// Get meeting attendance (not clients)
router.get('/meetings/:meetingId/attendance', authenticate, isNotClient, getMeetingAttendance);
// Join meeting
router.post('/meetings/:meetingId/join', authenticate, joinMeeting);
// Leave meeting
router.post('/meetings/:meetingId/leave', authenticate, leaveMeeting);
export default router;
//# sourceMappingURL=meetingAttendance.js.map