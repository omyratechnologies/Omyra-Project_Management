import { verifyToken } from '../utils/auth.js';
import { errorResponse } from '../utils/response.js';
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            errorResponse(res, 'Access denied. No token provided.', undefined, 401);
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            errorResponse(res, 'Invalid token.', undefined, 401);
            return;
        }
    }
    catch (error) {
        errorResponse(res, 'Authentication error.', undefined, 500);
        return;
    }
};
//# sourceMappingURL=auth.js.map