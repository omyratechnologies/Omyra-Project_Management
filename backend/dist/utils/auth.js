import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';
export const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};
export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};
export const createAuthResponse = (user, profile) => {
    const payload = {
        id: user.id.toString(),
        email: user.email,
        role: profile.role
    };
    const token = generateToken(payload);
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            profile: {
                id: profile.id,
                fullName: profile.fullName,
                email: profile.email,
                role: profile.role,
                avatar: profile.avatar
            }
        }
    };
};
//# sourceMappingURL=auth.js.map