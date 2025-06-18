export interface EmailMessage {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    private initializeTransporter;
    sendEmail(message: EmailMessage): Promise<boolean>;
    sendWelcomeEmail(to: string, userName: string, userEmail: string): Promise<boolean>;
    sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<boolean>;
    sendTaskAssignmentEmail(to: string, assigneeName: string, assignerName: string, projectName: string, taskTitle: string, taskDescription: string, dueDate: string, priority: string, taskId: string): Promise<boolean>;
    sendProjectInvitationEmail(to: string, inviteeName: string, inviterName: string, projectName: string, projectDescription: string, role: string, invitationToken: string): Promise<boolean>;
    startDeadlineReminders(): null;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService-simple.d.ts.map