import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';
import { config } from '../config/environment.js';
class EmailService extends EventEmitter {
    transporter = null;
    templates = new Map();
    emailQueue = [];
    isProcessing = false;
    stats = { sent: 0, failed: 0, queued: 0, delivered: 0 };
    constructor() {
        super();
        this.initializeTransporter();
        this.loadDefaultTemplates();
    }
    async initializeTransporter() {
        try {
            const emailConfig = {
                host: config.emailHost || 'smtp.gmail.com',
                port: config.emailPort || 587,
                secure: config.emailSecure || false,
                auth: {
                    user: config.emailUser || '',
                    pass: config.emailPassword || ''
                }
            };
            this.transporter = nodemailer.createTransport(emailConfig);
            if (this.transporter) {
                await this.transporter.verify();
            }
            console.log('✅ Email service connected successfully');
        }
        catch (error) {
            console.error('❌ Email service connection failed:', error);
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
        }
    }
    loadDefaultTemplates() {
        this.addTemplate({
            name: 'welcome',
            subject: 'Welcome to {{appName}}!',
            html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Welcome to {{appName}}!</h1>
          <p>Hi {{userName}},</p>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
      `,
            variables: ['appName', 'userName']
        });
        this.addTemplate({
            name: 'password-reset',
            subject: 'Reset Your Password - {{appName}}',
            html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p>Hi {{userName}},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" 
               style="background: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p><small>This link will expire in 1 hour. If you didn't request this, please ignore this email.</small></p>
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
      `,
            variables: ['appName', 'userName', 'resetLink']
        });
    }
    addTemplate(template) {
        this.templates.set(template.name, template);
    }
    async sendEmail(message) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            const result = await this.transporter.sendMail(message);
            this.stats.sent++;
            console.log('✅ Email sent successfully:', result.messageId);
            this.emit('emailSent', { message, result });
            return true;
        }
        catch (error) {
            this.stats.failed++;
            console.error('❌ Failed to send email:', error);
            this.emit('emailFailed', { message, error });
            return false;
        }
    }
    async sendTemplateEmail(templateName, to, variables, options) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }
        let subject = template.subject;
        let html = template.html;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, value);
            html = html.replace(regex, value);
        }
        const message = {
            from: config.emailFrom || 'noreply@omyra-project.com',
            to,
            subject,
            html,
            ...options
        };
        return this.sendEmail(message);
    }
    async sendWelcomeEmail(to, userName, userEmail) {
        return this.sendTemplateEmail('welcome', to, {
            appName: 'Omyra Project Nexus',
            userName,
            userEmail,
            dashboardUrl: `${config.frontendUrl}/dashboard`
        });
    }
    async sendPasswordResetEmail(to, userName, resetToken) {
        const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
        return this.sendTemplateEmail('password-reset', to, {
            appName: 'Omyra Project Nexus',
            userName,
            resetLink,
            expiryTime: '1 hour'
        });
    }
    getTemplates() {
        return Array.from(this.templates.keys());
    }
    getStats() {
        return { ...this.stats };
    }
    async testConnection() {
        try {
            if (!this.transporter) {
                return false;
            }
            await this.transporter.verify();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
export const emailService = new EmailService();
//# sourceMappingURL=emailService-new.js.map