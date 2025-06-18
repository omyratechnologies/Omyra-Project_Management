import { Router } from 'express';
import { createClient, registerClient, getClients, getClient, updateClient, approveClient, deactivateClient, deleteClient, getMyClientProfile } from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createClientSchema, updateClientSchema } from '../utils/validation.js';
import { z } from 'zod';
const router = Router();
// Parameter validation schema
const clientIdSchema = z.object({
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID format')
});
// Public routes
router.post('/register', validateBody(createClientSchema), registerClient);
// Protected routes (require authentication)
router.use(authenticate);
// Admin/PM routes - Create client accounts
router.post('/', validateBody(createClientSchema), createClient);
// Get all clients (admin/PM only)
router.get('/', getClients);
// Client profile routes
router.get('/me', getMyClientProfile); // For clients to get their own profile
router.get('/:clientId', validateParams(clientIdSchema), getClient);
router.put('/:clientId', validateParams(clientIdSchema), validateBody(updateClientSchema), updateClient);
// Admin-only routes
router.patch('/:clientId/approve', validateParams(clientIdSchema), approveClient);
router.patch('/:clientId/deactivate', validateParams(clientIdSchema), deactivateClient);
router.delete('/:clientId', validateParams(clientIdSchema), deleteClient);
export default router;
//# sourceMappingURL=clients.js.map