import { ZodError } from 'zod';
import { validationErrorResponse } from '../utils/response.js';
export const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                validationErrorResponse(res, formattedErrors);
                return;
            }
            next(error);
        }
    };
};
export const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                validationErrorResponse(res, formattedErrors);
                return;
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validation.js.map