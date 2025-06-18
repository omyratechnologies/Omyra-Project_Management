import express from 'express';
import { EmailController, emailValidation } from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Email service status (public for monitoring)
router.get('/status', EmailController.getStatus);

// Protected routes (require authentication)
router.use(authenticate);

// Send custom email
router.post('/send', emailValidation.sendEmail, EmailController.sendEmail);

// Send template-based email
router.post('/send-template', emailValidation.sendTemplateEmail, EmailController.sendTemplateEmail);

// Queue email for later sending
router.post('/queue', emailValidation.queueEmail, EmailController.queueEmail);

// Predefined template endpoints
router.post('/send-welcome', emailValidation.sendWelcomeEmail, EmailController.sendWelcomeEmail);
router.post('/send-password-reset', emailValidation.sendPasswordResetEmail, EmailController.sendPasswordResetEmail);
router.post('/send-task-assignment', emailValidation.sendTaskAssignmentEmail, EmailController.sendTaskAssignmentEmail);
router.post('/send-team-invitation', emailValidation.sendTeamInvitationEmail, EmailController.sendTeamInvitationEmail);

// Template management
router.post('/templates', emailValidation.addTemplate, EmailController.addTemplate);

export default router;
