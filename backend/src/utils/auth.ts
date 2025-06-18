import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';
import { AuthPayload } from '../types/index.js';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
};

export const createAuthResponse = (user: any, profile: any) => {
  const payload: AuthPayload = {
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
