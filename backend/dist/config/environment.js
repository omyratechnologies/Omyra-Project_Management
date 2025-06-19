import * as dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/omyra-project-nexus',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
    emailPort: parseInt(process.env.EMAIL_PORT || '587'),
    emailSecure: process.env.EMAIL_SECURE === 'true',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || 'noreply@omyra-project.com',
    emailDevMode: process.env.EMAIL_DEV_MODE === 'true',
    smtpUser: process.env.SMTP_USER || 'admin',
    smtpPassword: process.env.SMTP_PASSWORD || 'password123',
    smtpPort: parseInt(process.env.SMTP_PORT || '2525')
};
