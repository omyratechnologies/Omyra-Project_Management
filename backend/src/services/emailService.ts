import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// import { SMTPServer } from 'smtp-server';
// import { simpleParser } from 'mailparser';
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
    this.loadEmailTemplates();
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

  private loadEmailTemplates() {
    const templatesPath = join(__dirname, '../templates/email');
    
    try {
      // Load welcome template
      const welcomeHtml = readFileSync(join(templatesPath, 'welcome.html'), 'utf8');
      this.addTemplate({
        name: 'welcome',
        subject: 'Welcome to {{appName}}!',
        html: welcomeHtml,
        variables: ['appName', 'userName', 'userEmail', 'dashboardUrl']
      });

      // Load password reset template
      const passwordResetHtml = readFileSync(join(templatesPath, 'password-reset.html'), 'utf8');
      this.addTemplate({
        name: 'password-reset',
        subject: 'Reset Your Password - {{appName}}',
        html: passwordResetHtml,
        variables: ['appName', 'userName', 'resetLink', 'expiryTime']
      });

      // Load task assigned template
      const taskAssignedHtml = readFileSync(join(templatesPath, 'task-assigned.html'), 'utf8');
      this.addTemplate({
        name: 'task-assigned',
        subject: 'New Task Assigned: {{taskTitle}}',
        html: taskAssignedHtml,
        variables: ['assigneeName', 'assignerName', 'projectName', 'taskTitle', 'taskDescription', 'dueDate', 'priority', 'priorityColor', 'taskUrl', 'appName']
      });

      // Load project invitation template
      const projectInvitationHtml = readFileSync(join(templatesPath, 'project-invitation.html'), 'utf8');
      this.addTemplate({
        name: 'project-invitation',
        subject: 'You\'ve been invited to join {{projectName}}',
        html: projectInvitationHtml,
        variables: ['inviteeName', 'inviterName', 'projectName', 'projectDescription', 'role', 'invitationUrl', 'appName']
      });

      // Load task deadline reminder template
      const deadlineReminderHtml = readFileSync(join(templatesPath, 'task-deadline-reminder.html'), 'utf8');
      this.addTemplate({
        name: 'task-deadline-reminder',
        subject: 'Task Deadline Reminder: {{taskTitle}}',
        html: deadlineReminderHtml,
        variables: ['userName', 'taskTitle', 'projectName', 'dueDate', 'timeRemaining', 'priority', 'priorityColor', 'taskUrl', 'appName']
      });

      // Load project status update template
      const statusUpdateHtml = readFileSync(join(templatesPath, 'project-status-update.html'), 'utf8');
      this.addTemplate({
        name: 'project-status-update',
        subject: 'Project Update: {{projectName}}',
        html: statusUpdateHtml,
        variables: ['userName', 'projectName', 'updateType', 'updateMessage', 'completionPercentage', 'tasksCompleted', 'totalTasks', 'projectUrl', 'appName']
      });

      console.log('✅ Email templates loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load email templates:', error);
      // Fallback to default templates
      this.loadDefaultTemplates();
    }
  }

  private loadDefaultTemplates() {
    // Welcome email template
    this.addTemplate({
      name: 'welcome',
      subject: 'Welcome to {{appName}}!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Welcome to {{appName}}!</h1>
          <p>Hi {{userName}},</p>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Getting Started:</h3>
            <ul>
              <li>Complete your profile setup</li>
              <li>Explore the dashboard</li>
              <li>Create your first project</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
      `,
      variables: ['appName', 'userName']
    });

    // Password reset template
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

    // Task assignment template
    this.addTemplate({
      name: 'task-assigned',
      subject: 'New Task Assigned: {{taskTitle}}',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">New Task Assigned</h1>
          <p>Hi {{assigneeName}},</p>
          <p>You've been assigned a new task in project <strong>{{projectName}}</strong>:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{{taskTitle}}</h3>
            <p><strong>Description:</strong> {{taskDescription}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Priority:</strong> <span style="color: {{priorityColor}};">{{priority}}</span></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{taskUrl}}" 
               style="background: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              View Task
            </a>
          </div>
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
      `,
      variables: ['assigneeName', 'projectName', 'taskTitle', 'taskDescription', 'dueDate', 'priority', 'priorityColor', 'taskUrl', 'appName']
    });
  }

  public addTemplate(template: EmailTemplate) {
    this.templates.set(template.name, template);
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

  public async sendTemplateEmail(
    templateName: string, 
    to: string | string[], 
    variables: Record<string, string>,
    options?: Partial<EmailMessage>
  ): Promise<boolean> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Replace variables in subject and HTML
    let subject = template.subject;
    let html = template.html;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    }

    const message: EmailMessage = {
      from: config.emailFrom || 'noreply@omyra-project.com',
      to,
      subject,
      html,
      ...options
    };

    return this.sendEmail(message);
  }

  // Convenience methods for common email types
  public async sendWelcomeEmail(to: string, userName: string, userEmail: string): Promise<boolean> {
    return this.sendTemplateEmail('welcome', to, {
      appName: 'Omyra Project Nexus',
      userName,
      userEmail,
      dashboardUrl: `${config.frontendUrl}/dashboard`
    });
  }

  public async sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<boolean> {
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    return this.sendTemplateEmail('password-reset', to, {
      appName: 'Omyra Project Nexus',
      userName,
      resetLink,
      expiryTime: '1 hour'
    });
  }

  public async sendTaskAssignmentEmail(
    to: string, 
    assigneeName: string,
    assignerName: string,
    projectName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate: string,
    priority: string,
    taskId: string
  ): Promise<boolean> {
    const priorityColors: Record<string, string> = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">New Task Assigned</h1>
        <p>Hi ${assigneeName},</p>
        <p>You've been assigned a new task in project <strong>${projectName}</strong>:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${taskTitle}</h3>
          <p><strong>Description:</strong> ${taskDescription}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> <span style="color: ${priorityColors[priority.toLowerCase()] || '#6c757d'};">${priority.toUpperCase()}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/tasks/${taskId}" 
             style="background: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task
          </a>
        </div>
        <p>Best regards,<br>The Omyra Project Nexus Team</p>
      </div>
    `;

    const message: EmailMessage = {
      from: config.emailFrom || 'noreply@omyra-project.com',
      to,
      subject: `New Task Assigned: ${taskTitle}`,
      html
    };

    return this.sendEmail(message);
  }

  public async sendProjectInvitationEmail(
    to: string,
    inviteeName: string,
    inviterName: string,
    projectName: string,
    projectDescription: string,
    role: string,
    invitationToken: string
  ): Promise<boolean> {
    const invitationUrl = `${config.frontendUrl}/join-project?token=${invitationToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Project Invitation</h1>
        <p>Hi ${inviteeName},</p>
        <p>${inviterName} has invited you to join the project <strong>${projectName}</strong> as a ${role}.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${projectName}</h3>
          <p>${projectDescription}</p>
          <p><strong>Role:</strong> ${role}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" 
             style="background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>Best regards,<br>The Omyra Project Nexus Team</p>
      </div>
    `;

    const message: EmailMessage = {
      from: config.emailFrom || 'noreply@omyra-project.com',
      to,
      subject: `You've been invited to join ${projectName}`,
      html
    };

    return this.sendEmail(message);
  }

  public async queueEmail(message: EmailMessage) {
    this.emailQueue.push(message);
    this.stats.queued++;
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.emailQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const message = this.emailQueue.shift();
    
    if (message) {
      this.stats.queued--;
      const success = await this.sendEmail(message);
      if (success) {
        this.stats.delivered++;
      }
      // Small delay between emails to avoid rate limiting
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  public getQueueLength(): number {
    return this.emailQueue.length;
  }

  public startSMTPServer(port: number = 2525) {
    console.log(`📬 SMTP Server functionality is disabled in this version. Port ${port} would be used.`);
    // SMTP server functionality temporarily disabled for stability
  }

  public getTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  public getStats(): EmailStats {
    return { ...this.stats };
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }

  public async sendTaskDeadlineReminder(
    to: string,
    userName: string,
    taskTitle: string,
    projectName: string,
    dueDate: string,
    timeRemaining: string,
    priority: string,
    taskId: string
  ): Promise<boolean> {
    const priorityColors: Record<string, string> = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Task Deadline Reminder</h1>
        <p>Hi ${userName},</p>
        <p>This is a reminder that your task in project <strong>${projectName}</strong> is due soon:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${taskTitle}</h3>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Time Remaining:</strong> ${timeRemaining}</p>
          <p><strong>Priority:</strong> <span style="color: ${priorityColors[priority.toLowerCase()] || '#6c757d'};">${priority.toUpperCase()}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/tasks/${taskId}" 
             style="background: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task
          </a>
        </div>
        <p>Best regards,<br>The Omyra Project Nexus Team</p>
      </div>
    `;

    const message: EmailMessage = {
      from: config.emailFrom || 'noreply@omyra-project.com',
      to,
      subject: `Task Deadline Reminder: ${taskTitle}`,
      html
    };

    return this.sendEmail(message);
  }

  // Task deadline reminder scheduler
  public startDeadlineReminders() {
    // Check for upcoming deadlines every hour
    const checkInterval = 60 * 60 * 1000; // 1 hour
    
    const checkDeadlines = async () => {
      try {
        const { Task, Project, User } = await import('../models/index.js');
        
        // Find tasks due in the next 24 hours
        const tomorrow = new Date();
        tomorrow.setHours(23, 59, 59, 999);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tasksDueSoon = await Task.find({
          dueDate: { $gte: today, $lte: tomorrow },
          status: { $ne: 'completed' },
          assignedTo: { $ne: null }
        })
        .populate('assignedTo', 'email')
        .populate({
          path: 'assignedTo',
          populate: {
            path: 'profile',
            select: 'fullName'
          }
        })
        .populate('project', 'title');

        for (const task of tasksDueSoon) {
          const assignee = task.assignedTo as any;
          const project = task.project as any;
          
          if (assignee && assignee.email && task.dueDate) {
            const userName = assignee.profile?.fullName || assignee.email.split('@')[0];
            const timeRemaining = this.getTimeRemaining(task.dueDate);
            
            await this.sendTaskDeadlineReminder(
              assignee.email,
              userName,
              task.title,
              project.title,
              task.dueDate.toLocaleDateString(),
              timeRemaining,
              task.priority || 'medium',
              task._id.toString()
            );
          }
        }
      } catch (error) {
        console.error('Error checking task deadlines:', error);
      }
    };

    // Start the scheduler
    const intervalId = setInterval(checkDeadlines, checkInterval);
    
    // Run once immediately
    checkDeadlines();
    
    return intervalId;
  }

  private getTimeRemaining(dueDate: Date): string {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Overdue';
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    } else {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
  }
}

export const emailService = new EmailService();
