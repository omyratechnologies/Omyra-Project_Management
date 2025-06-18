export interface EmailMessage {
    from: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
}
export declare class EmailService {
    private transporter;
    private queue;
    private templates;
    private lastError;
    constructor();
    private initializeTransporter;
    sendEmail(message: EmailMessage): Promise<boolean>;
    sendTeamInvitationEmail(to: string, inviteeName: string, inviterName: string, organizationName: string, role: string, invitationToken: string): Promise<boolean>;
    sendWelcomeEmail(to: string, data: {
        fullName: string;
        password?: string;
        role: string;
    }, options?: {
        role: string;
    }): Promise<boolean>;
    sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<boolean>;
    sendTaskAssignmentEmail(to: string, assigneeName: string, assignerName: string, projectName: string, taskTitle: string, taskDescription: string, dueDate: string, priority: string, taskId: string): Promise<boolean>;
    sendProjectInvitationEmail(to: string, inviteeName: string, inviterName: string, projectName: string, projectDescription: string, role: string, invitationToken: string): Promise<boolean>;
    sendTemplateEmail(templateName: string, to: string, variables: any): Promise<boolean>;
    queueEmail(message: any): Promise<void>;
    getQueueLength(): number;
    testConnection(): Promise<boolean>;
    getTemplates(): any[];
    addTemplate(template: any): void;
    startSMTPServer(port: number): void;
    startDeadlineReminders(): void;
    on(event: string, callback: Function): void;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map