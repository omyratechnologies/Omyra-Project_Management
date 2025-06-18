import { EventEmitter } from 'events';
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
declare class EmailService extends EventEmitter {
    private transporter;
    private templates;
    private emailQueue;
    private isProcessing;
    private stats;
    constructor();
    private initializeTransporter;
    private loadDefaultTemplates;
    addTemplate(template: EmailTemplate): void;
    sendEmail(message: EmailMessage): Promise<boolean>;
    sendTemplateEmail(templateName: string, to: string | string[], variables: Record<string, string>, options?: Partial<EmailMessage>): Promise<boolean>;
    sendWelcomeEmail(to: string, userName: string, userEmail: string): Promise<boolean>;
    sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<boolean>;
    getTemplates(): string[];
    getStats(): EmailStats;
    testConnection(): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService-new.d.ts.map