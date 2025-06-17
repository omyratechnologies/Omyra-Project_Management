import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { config } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailMessage {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  variables: string[];
}

export interface EmailStats {
  sent: number;
  failed: number;
  queued: number;
  delivered: number;
}

class EmailService extends EventEmitter {
  private transporter: nodemailer.Transporter | null = null;
  private smtpServer: any = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private emailQueue: EmailMessage[] = [];
  private isProcessing = false;
  private stats: EmailStats = { sent: 0, failed: 0, queued: 0, delivered: 0 };

  constructor() {
    super();
    this.initializeTransporter();
    // this.loadEmailTemplates(); // Temporarily commented for debugging
  }

  private async initializeTransporter() {
    try {
      // Configuration for different email providers
      const emailConfig: EmailConfig = {
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
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      // Fallback to file transport for development
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  public async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const result = await this.transporter.sendMail(message);
      this.stats.sent++;
      console.log('✅ Email sent successfully:', result.messageId);
      this.emit('emailSent', { message, result });
      return true;
    } catch (error) {
      this.stats.failed++;
      console.error('❌ Failed to send email:', error);
      this.emit('emailFailed', { message, error });
      return false;
    }
  }
}

export const emailService = new EmailService();
