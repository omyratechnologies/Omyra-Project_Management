import { Router } from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import teamRoutes from './team.js';
import companyRoutes from './company.js';
import emailRoutes from './email.js';
import meetingRoutes from './meetings.js';
import taskIssueRoutes from './taskIssues.js';
import feedbackRoutes from './feedback.js';
import meetingAttendanceRoutes from './meetingAttendance.js';
import confluenceRoutes from './confluence.js';
import clientRoutes from './clients.js';
import invitationRoutes from './invitations.js';
import adminRoutes from './admin.js';
const router = Router();
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/team', teamRoutes);
router.use('/company', companyRoutes);
router.use('/email', emailRoutes);
router.use('/meetings', meetingRoutes);
router.use('/clients', clientRoutes);
router.use('/invitations', invitationRoutes);
router.use('/', taskIssueRoutes);
router.use('/', feedbackRoutes);
router.use('/', meetingAttendanceRoutes);
router.use('/confluence', confluenceRoutes);
router.use('/invitations', invitationRoutes);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Omyra Project Management API is running',
        timestamp: new Date().toISOString()
    });
});
export default router;
//# sourceMappingURL=index.js.map