import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export declare const successResponse: <T>(res: Response, message: string, data?: T, statusCode?: number) => Response<ApiResponse<T>>;
export declare const errorResponse: (res: Response, message: string, error?: string, statusCode?: number) => Response<ApiResponse>;
export declare const validationErrorResponse: (res: Response, errors: any[]) => Response<ApiResponse>;
//# sourceMappingURL=response.d.ts.map