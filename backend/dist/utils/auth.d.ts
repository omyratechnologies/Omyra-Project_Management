import { AuthPayload } from '../types/index.js';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: AuthPayload) => string;
export declare const verifyToken: (token: string) => AuthPayload;
export declare const createAuthResponse: (user: any, profile: any) => {
    token: string;
    user: {
        id: any;
        email: any;
        profile: {
            id: any;
            fullName: any;
            email: any;
            role: any;
            avatar: any;
        };
    };
};
//# sourceMappingURL=auth.d.ts.map