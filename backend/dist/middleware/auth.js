import { verifyToken } from '../utils/auth.js';
import { errorResponse } from '../utils/response.js';
import { config } from '../config/environment.js';
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const message = config.nodeEnv === 'production'
                ? 'Authentication required'
                : 'Access denied. No token provided.';
            errorResponse(res, message, undefined, 401);
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            if (config.nodeEnv === 'production') {
                console.error('Token verification failed:', error);
            }
            const message = config.nodeEnv === 'production'
                ? 'Authentication failed'
                : 'Invalid token.';
            errorResponse(res, message, undefined, 401);
            return;
        }
    }
    catch (error) {
        if (config.nodeEnv === 'production') {
            console.error('Authentication middleware error:', error);
        }
        const message = config.nodeEnv === 'production'
            ? 'Internal server error'
            : 'Authentication error.';
        errorResponse(res, message, undefined, 500);
        return;
    }
};
