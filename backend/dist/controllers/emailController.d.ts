import { Request, Response } from 'express';
export declare class EmailController {
    static sendEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static sendTemplateEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static queueEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        queued: boolean;
        queueLength: number;
    }>, Record<string, any>>>;
    static getStatus(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        connected: boolean;
        queueLength: number;
        availableTemplates: any[];
    }>, Record<string, any>>>;
    static sendWelcomeEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static sendPasswordResetEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static sendTaskAssignmentEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static sendTeamInvitationEmail(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        sent: boolean;
    }>, Record<string, any>>>;
    static addTemplate(req: Request, res: Response): Promise<Response<import("../utils/response.js").ApiResponse<{
        templateName: any;
        availableTemplates: any[];
    }>, Record<string, any>>>;
}
export declare const emailValidation: {
    sendEmail: import("express-validator").ValidationChain[];
    sendTemplateEmail: import("express-validator").ValidationChain[];
    queueEmail: import("express-validator").ValidationChain[];
    addTemplate: import("express-validator").ValidationChain[];
    sendWelcomeEmail: import("express-validator").ValidationChain[];
    sendPasswordResetEmail: import("express-validator").ValidationChain[];
    sendTaskAssignmentEmail: import("express-validator").ValidationChain[];
    sendTeamInvitationEmail: import("express-validator").ValidationChain[];
};
//# sourceMappingURL=emailController.d.ts.map