import { Router } from 'express';
import { getTeamMembers, getTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, canViewAllTeamMembers, canViewTeamMember, canUpdateTeamMember } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';
const router = Router();
router.use(authenticate);
const updateTeamMemberSchema = z.object({
    fullName: z.string().min(1).trim().optional(),
    role: z.enum(['admin', 'project_manager', 'team_member']).optional(),
    avatar: z.string().optional()
});
router.get('/', canViewAllTeamMembers, getTeamMembers);
router.get('/:id', canViewTeamMember, getTeamMember);
router.put('/:id', canUpdateTeamMember, validateBody(updateTeamMemberSchema), updateTeamMember);
router.patch('/:id', canUpdateTeamMember, validateBody(updateTeamMemberSchema), updateTeamMember);
router.delete('/:id', isAdmin, deleteTeamMember);
export default router;
