import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/environment.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class EmailService extends EventEmitter {
    transporter = null;
    smtpServer = null;
    templates = new Map();
    emailQueue = [];
    isProcessing = false;
    stats = { sent: 0, failed: 0, queued: 0, delivered: 0 };
    constructor() {
        super();
        this.initializeTransporter();
        // this.loadEmailTemplates(); // Temporarily commented for debugging
    }
    async initializeTransporter() {
        try {
            // Configuration for different email providers
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
            // Verify connection
            if (this.transporter) {
                await this.transporter.verify();
            }
            console.log('✅ Email service connected successfully');
        }
        catch (error) {
            console.error('❌ Email service connection failed:', error);
            // Fallback to file transport for development
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
}
export const emailService = new EmailService();
//# sourceMappingURL=emailService-debug.js.map