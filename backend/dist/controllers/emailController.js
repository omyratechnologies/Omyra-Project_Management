import { emailService } from '../services/emailService.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';
import { body, validationResult } from 'express-validator';
export class EmailController {
    static async sendEmail(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationErrorResponse(res, errors.array());
            }
            const { to, subject, text, html, cc, bcc } = req.body;
            const success = await emailService.sendEmail({
                from: req.body.from || 'noreply@omyra-project.com',
                to,
                cc,
                bcc,
                subject,
                text,
                html
            });
            if (success) {
                return successResponse(res, 'Email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async sendTemplateEmail(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationErrorResponse(res, errors.array());
            }
            const { templateName, to, variables } = req.body;
            const success = await emailService.sendTemplateEmail(templateName, to, variables);
            if (success) {
                return successResponse(res, 'Template email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send template email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending template email:', error);
            return errorResponse(res, error instanceof Error ? error.message : 'Internal server error', undefined, 500);
        }
    }
    static async queueEmail(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationErrorResponse(res, errors.array());
            }
            const { to, subject, text, html, cc, bcc } = req.body;
            await emailService.queueEmail({
                from: req.body.from || 'noreply@omyra-project.com',
                to,
                cc,
                bcc,
                subject,
                text,
                html
            });
            return successResponse(res, 'Email queued successfully', {
                queued: true,
                queueLength: emailService.getQueueLength()
            });
        }
        catch (error) {
            console.error('Error queueing email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async getStatus(req, res) {
        try {
            const isConnected = await emailService.testConnection();
            const queueLength = emailService.getQueueLength();
            const templates = emailService.getTemplates();
            return successResponse(res, 'Email service status', {
                connected: isConnected,
                queueLength,
                availableTemplates: templates
            });
        }
        catch (error) {
            console.error('Error getting email service status:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async sendWelcomeEmail(req, res) {
        try {
            const { email, userName } = req.body;
            const success = await emailService.sendTemplateEmail('welcome', email, {
                appName: 'Omyra Project Management',
                userName: userName || 'User'
            });
            if (success) {
                return successResponse(res, 'Welcome email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send welcome email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending welcome email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async sendPasswordResetEmail(req, res) {
        try {
            const { email, userName, resetLink } = req.body;
            const success = await emailService.sendTemplateEmail('password-reset', email, {
                appName: 'Omyra Project Management',
                userName: userName || 'User',
                resetLink
            });
            if (success) {
                return successResponse(res, 'Password reset email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send password reset email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async sendTaskAssignmentEmail(req, res) {
        try {
            const { email, assigneeName, projectName, taskTitle, taskDescription, dueDate, priority, taskLink } = req.body;
            const priorityColors = {
                low: '#28a745',
                medium: '#ffc107',
                high: '#fd7e14',
                urgent: '#dc3545'
            };
            const success = await emailService.sendTemplateEmail('task-assigned', email, {
                appName: 'Omyra Project Management',
                assigneeName: assigneeName || 'User',
                projectName,
                taskTitle,
                taskDescription,
                dueDate,
                priority,
                priorityColor: priorityColors[priority.toLowerCase()] || '#6c757d',
                taskLink
            });
            if (success) {
                return successResponse(res, 'Task assignment email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send task assignment email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending task assignment email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async sendTeamInvitationEmail(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationErrorResponse(res, errors.array());
            }
            const { email, inviteeName, inviterName, organizationName, role, invitationToken } = req.body;
            const success = await emailService.sendTeamInvitationEmail(email, inviteeName, inviterName, organizationName || 'Omyra Project Nexus', role, invitationToken);
            if (success) {
                return successResponse(res, 'Team invitation email sent successfully', { sent: true });
            }
            else {
                return errorResponse(res, 'Failed to send team invitation email', undefined, 500);
            }
        }
        catch (error) {
            console.error('Error sending team invitation email:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
    static async addTemplate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return validationErrorResponse(res, errors.array());
            }
            const { name, subject, html, variables } = req.body;
            emailService.addTemplate({ name, subject, html, variables });
            return successResponse(res, 'Template added successfully', {
                templateName: name,
                availableTemplates: emailService.getTemplates()
            });
        }
        catch (error) {
            console.error('Error adding email template:', error);
            return errorResponse(res, 'Internal server error', undefined, 500);
        }
    }
}
export const emailValidation = {
    sendEmail: [
        body('to').isEmail().withMessage('Valid email address is required'),
        body('subject').notEmpty().withMessage('Subject is required'),
        body('text').optional().isString(),
        body('html').optional().isString()
    ],
    sendTemplateEmail: [
        body('templateName').notEmpty().withMessage('Template name is required'),
        body('to').isEmail().withMessage('Valid email address is required'),
        body('variables').isObject().withMessage('Variables must be an object')
    ],
    queueEmail: [
        body('to').isEmail().withMessage('Valid email address is required'),
        body('subject').notEmpty().withMessage('Subject is required'),
        body('text').optional().isString(),
        body('html').optional().isString()
    ],
    addTemplate: [
        body('name').notEmpty().withMessage('Template name is required'),
        body('subject').notEmpty().withMessage('Subject is required'),
        body('html').notEmpty().withMessage('HTML content is required'),
        body('variables').isArray().withMessage('Variables must be an array')
    ],
    sendWelcomeEmail: [
        body('email').isEmail().withMessage('Valid email address is required'),
        body('userName').optional().isString()
    ],
    sendPasswordResetEmail: [
        body('email').isEmail().withMessage('Valid email address is required'),
        body('resetLink').isURL().withMessage('Valid reset link is required'),
        body('userName').optional().isString()
    ],
    sendTaskAssignmentEmail: [
        body('email').isEmail().withMessage('Valid email address is required'),
        body('projectName').notEmpty().withMessage('Project name is required'),
        body('taskTitle').notEmpty().withMessage('Task title is required'),
        body('taskDescription').notEmpty().withMessage('Task description is required'),
        body('dueDate').notEmpty().withMessage('Due date is required'),
        body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
        body('taskLink').isURL().withMessage('Valid task link is required'),
        body('assigneeName').optional().isString()
    ],
    sendTeamInvitationEmail: [
        body('email').isEmail().withMessage('Valid email address is required'),
        body('inviteeName').notEmpty().withMessage('Invitee name is required'),
        body('inviterName').notEmpty().withMessage('Inviter name is required'),
        body('organizationName').optional().isString(),
        body('role').isIn(['admin', 'project_manager', 'team_member']).withMessage('Role must be admin, project_manager, or team_member'),
        body('invitationToken').notEmpty().withMessage('Invitation token is required')
    ]
};
