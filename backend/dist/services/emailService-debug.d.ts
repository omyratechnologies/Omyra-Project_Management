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
    private smtpServer;
    private templates;
    private emailQueue;
    private isProcessing;
    private stats;
    constructor();
    private initializeTransporter;
    sendEmail(message: EmailMessage): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService-debug.d.ts.map