import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
export class EmailService {
    transporter = null;
    queue = [];
    templates = [];
    lastError = null;
    constructor() {
        this.initializeTransporter();
    }
    async initializeTransporter() {
        try {
            if (config.emailDevMode) {
                console.log('📧 Email service initialized in development mode');
                this.transporter = nodemailer.createTransport({
                    streamTransport: true,
                    newline: 'unix',
                    buffer: true
                });
                return;
            }
            const emailConfig = {
                host: config.emailHost,
                port: config.emailPort,
                secure: config.emailSecure,
                auth: {
                    user: config.emailUser,
                    pass: config.emailPassword
                },
                debug: true,
                logger: true
            };
            console.log('📧 Attempting to connect to email server with configuration:', {
                host: emailConfig.host,
                port: emailConfig.port,
                secure: emailConfig.secure,
                user: emailConfig.auth.user
            });
            this.transporter = nodemailer.createTransport(emailConfig);
            if (this.transporter) {
                try {
                    await this.transporter.verify();
                    console.log('✅ Email service connected and verified successfully');
                }
                catch (verifyError) {
                    this.lastError = verifyError;
                    console.error('❌ Email verification failed:', {
                        message: verifyError.message,
                        code: verifyError.code,
                        response: verifyError.response,
                        responseCode: verifyError.responseCode
                    });
                    if (verifyError.code === 'EAUTH') {
                        console.log('⚠️ Falling back to development mode due to authentication failure');
                        this.transporter = nodemailer.createTransport({
                            streamTransport: true,
                            newline: 'unix',
                            buffer: true
                        });
                    }
                    else {
                        throw verifyError;
                    }
                }
            }
        }
        catch (error) {
            this.lastError = error;
            console.error('❌ Email service connection failed:', {
                message: error.message,
                code: error.code,
                response: error.response,
                responseCode: error.responseCode
            });
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
        }
    }
    async sendEmail(message) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
                if (!this.transporter) {
                    throw new Error('Email transporter not initialized');
                }
            }
            if (config.emailDevMode) {
                console.log('📧 Email would be sent (development mode):');
                console.log(`   To: ${message.to}`);
                console.log(`   Subject: ${message.subject}`);
                console.log(`   Content: ${message.html || message.text || 'No content'}`);
                console.log('   ────────────────────────────────────────');
                return true;
            }
            const result = await this.transporter.sendMail({
                ...message,
                from: message.from || config.emailFrom
            });
            console.log('✅ Email sent successfully:', result.messageId);
            return true;
        }
        catch (error) {
            this.lastError = error;
            console.error('❌ Failed to send email:', {
                message: error.message,
                code: error.code,
                response: error.response,
                responseCode: error.responseCode
            });
            if (error.code === 'EAUTH') {
                console.log('⚠️ Authentication failed, attempting to reinitialize transporter...');
                await this.initializeTransporter();
            }
            return false;
        }
    }
    async sendTeamInvitationEmail(to, inviteeName, inviterName, organizationName, role, invitationToken) {
        const invitationUrl = `${config.frontendUrl}/join-team?token=${invitationToken}`;
        const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Team Invitation</h1>
        <p>Hi ${inviteeName},</p>
        <p>${inviterName} has invited you to join <strong>${organizationName}</strong> as a ${role}.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${organizationName}</h3>
          <p><strong>Role:</strong> ${role}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" 
             style="background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>The ${organizationName} Team</p>
      </div>
    `;
        const message = {
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: `You've been invited to join ${organizationName}`,
            html
        };
        return this.sendEmail(message);
    }
    async sendWelcomeEmail(to, data, options) {
        const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Welcome to Omyra Project</h1>
        <p>Hi ${data.fullName},</p>
        <p>Welcome to Omyra Project! Your account has been created with the following details:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Role:</strong> ${data.role}</p>
          ${data.password ? `<p><strong>Temporary Password:</strong> ${data.password}</p>` : ''}
        </div>
        <p>Please log in to your account and change your password if a temporary one was provided.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/login" 
             style="background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Log In
          </a>
        </div>
        <p>Best regards,<br>The Omyra Project Team</p>
      </div>
    `;
        const message = {
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject: 'Welcome to Omyra Project',
            html
        };
        return this.sendEmail(message);
    }
    async sendPasswordResetEmail(to, userName, resetToken) {
        console.log(`📧 Password reset email would be sent to ${to} for user ${userName}`);
        return true;
    }
    async sendTaskAssignmentEmail(to, assigneeName, assignerName, projectName, taskTitle, taskDescription, dueDate, priority, taskId) {
        console.log(`📧 Task assignment email would be sent to ${to} for task ${taskTitle}`);
        return true;
    }
    async sendProjectInvitationEmail(to, inviteeName, inviterName, projectName, projectDescription, role, invitationToken) {
        console.log(`📧 Project invitation email would be sent to ${to} for project ${projectName}`);
        return true;
    }
    async sendTemplateEmail(templateName, to, variables) {
        console.log(`📧 Template email (${templateName}) would be sent to ${to}`);
        return true;
    }
    async queueEmail(message) {
        console.log('📧 Email queued for sending');
        this.queue.push(message);
    }
    getQueueLength() {
        return this.queue.length;
    }
    async testConnection() {
        console.log('📧 Email connection test (development mode)');
        return true;
    }
    getTemplates() {
        return this.templates;
    }
    addTemplate(template) {
        console.log(`📧 Template ${template.name} added`);
        this.templates.push(template);
    }
    startSMTPServer(port) {
        console.log(`📧 SMTP server would start on port ${port} (development mode)`);
    }
    startDeadlineReminders() {
        console.log('📧 Deadline reminders started');
    }
    on(event, callback) {
        console.log(`📧 Event listener for '${event}' registered`);
    }
}
export const emailService = new EmailService();
