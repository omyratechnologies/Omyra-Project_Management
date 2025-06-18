import { Router } from 'express';
import { sendTeamInvitation, acceptInvitation, getInvitationDetails } from '../controllers/invitationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';
const router = Router();
const sendInvitationSchema = z.object({
    email: z.string().email('Valid email address is required'),
    fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
    role: z.enum(['admin', 'project_manager', 'team_member']),
    organizationName: z.string().optional(),
    projectId: z.string().optional()
});
const acceptInvitationSchema = z.object({
    token: z.string().min(1, 'Invitation token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});
// Send team invitation (authenticated)
router.post('/send', authenticate, validateBody(sendInvitationSchema), sendTeamInvitation);
// Accept invitation (public)
router.post('/accept', validateBody(acceptInvitationSchema), acceptInvitation);
// Get invitation details (public)
router.get('/details/:token', getInvitationDetails);
export default router;
//# sourceMappingURL=invitations.js.map