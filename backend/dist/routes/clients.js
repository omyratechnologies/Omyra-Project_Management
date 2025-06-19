import { Router } from 'express';
import { createClient, getClients, getClient, updateClient, approveClient, deactivateClient, deleteClient, getMyClientProfile, getClientDashboardStats, getClientProjects, getClientRecentActivity, getClientFeedback } from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createClientSchema, updateClientSchema } from '../utils/validation.js';
import { z } from 'zod';
const router = Router();
const clientIdSchema = z.object({
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format')
});
router.use(authenticate);
router.post('/', validateBody(createClientSchema), createClient);
router.get('/', getClients);
router.get('/me', getMyClientProfile);
router.get('/dashboard/stats', getClientDashboardStats);
router.get('/dashboard/projects', getClientProjects);
router.get('/dashboard/activity', getClientRecentActivity);
router.get('/dashboard/feedback', getClientFeedback);
router.get('/:clientId', validateParams(clientIdSchema), getClient);
router.put('/:clientId', validateParams(clientIdSchema), validateBody(updateClientSchema), updateClient);
router.patch('/:clientId/approve', validateParams(clientIdSchema), approveClient);
router.patch('/:clientId/deactivate', validateParams(clientIdSchema), deactivateClient);
router.delete('/:clientId', validateParams(clientIdSchema), deleteClient);
export default router;
