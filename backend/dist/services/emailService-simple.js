import * as nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
class EmailService {
    transporter = null;
    constructor() {
        this.initializeTransporter();
    }
    async initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                host: config.emailHost || 'smtp.gmail.com',
                port: config.emailPort || 587,
                secure: config.emailSecure || false,
                auth: {
                    user: config.emailUser || '',
                    pass: config.emailPassword || ''
                }
            });
            console.log('✅ Email service initialized');
        }
        catch (error) {
            console.error('❌ Email service initialization failed:', error);
        }
    }
    async sendEmail(message) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            await this.transporter.sendMail(message);
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(to, userName, userEmail) {
        return this.sendEmail({
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: 'Welcome to Omyra Project Nexus!',
            html: `<h1>Welcome ${userName}!</h1><p>Thank you for joining our platform.</p>`
        });
    }
    async sendPasswordResetEmail(to, userName, resetToken) {
        const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
        return this.sendEmail({
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: 'Password Reset Request',
            html: `<h1>Password Reset</h1><p>Hi ${userName}, <a href="${resetLink}">click here to reset your password</a></p>`
        });
    }
    async sendTaskAssignmentEmail(to, assigneeName, assignerName, projectName, taskTitle, taskDescription, dueDate, priority, taskId) {
        return this.sendEmail({
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: `New Task Assigned: ${taskTitle}`,
            html: `<h1>New Task Assigned</h1><p>Hi ${assigneeName}, you've been assigned a new task: ${taskTitle} in project ${projectName}</p>`
        });
    }
    async sendProjectInvitationEmail(to, inviteeName, inviterName, projectName, projectDescription, role, invitationToken) {
        return this.sendEmail({
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: `Project Invitation: ${projectName}`,
            html: `<h1>Project Invitation</h1><p>Hi ${inviteeName}, you've been invited to join ${projectName} as ${role}</p>`
        });
    }
    startDeadlineReminders() {
        console.log('Deadline reminders started');
        return null;
    }
}
export const emailService = new EmailService();
//# sourceMappingURL=emailService-simple.js.map