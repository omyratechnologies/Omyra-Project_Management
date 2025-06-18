import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { canCreateFeedback, isAdminOrProjectManager } from '../middleware/rbac.js';
import {
  createClientFeedback,
  getProjectFeedback,
  updateClientFeedback,
  getClientFeedback,
  deleteClientFeedback
} from '../controllers/clientFeedbackController.js';

const router = Router();

// Create client feedback (clients only)
router.post('/projects/:projectId/feedback', authenticate, canCreateFeedback, createClientFeedback);

// Get project feedback (admins and PMs)
router.get('/projects/:projectId/feedback', authenticate, isAdminOrProjectManager, getProjectFeedback);

// Get specific feedback
router.get('/feedback/:feedbackId', authenticate, getClientFeedback);

// Update feedback response (admins and PMs)
router.put('/feedback/:feedbackId', authenticate, isAdminOrProjectManager, updateClientFeedback);

// Delete feedback (admin or client who created it)
router.delete('/feedback/:feedbackId', authenticate, deleteClientFeedback);

export default router;
