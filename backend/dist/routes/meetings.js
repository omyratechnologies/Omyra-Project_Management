import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createMeeting, getMeetings, getMeetingById, updateMeeting, updateMeetingLink, deleteMeeting, getUpcomingMeetings } from '../controllers/meetingController.js';
import { canManageMeetings, canEditMeetingLinks, canDeleteMeeting } from '../middleware/rbac.js';
const router = Router();
// All meeting routes require authentication
router.use(authenticate);
// GET /api/meetings/upcoming - Get upcoming meetings for the user
router.get('/upcoming', getUpcomingMeetings);
// GET /api/meetings - Get all meetings (with filtering)
router.get('/', getMeetings);
// POST /api/meetings - Create a new meeting
router.post('/', canManageMeetings, createMeeting);
// GET /api/meetings/:id - Get a specific meeting
router.get('/:id', getMeetingById);
// PUT /api/meetings/:id - Update a meeting
router.put('/:id', updateMeeting);
// PUT /api/meetings/:id/link - Update meeting link (PM can edit links)
router.put('/:id/link', canEditMeetingLinks, updateMeetingLink);
// DELETE /api/meetings/:id - Delete a meeting (admin only)
router.delete('/:id', canDeleteMeeting, deleteMeeting);
export default router;
//# sourceMappingURL=meetings.js.map