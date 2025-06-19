import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notificationService } from './services/notificationService.js';
const app = express();
const server = createServer(app);
if (config.nodeEnv === 'production') {
    app.set('trust proxy', 1);
}
if (config.nodeEnv === 'production') {
    app.use(compression());
}
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'development' ? 1000 : 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
});
app.use(limiter);
const corsOrigins = config.nodeEnv === 'production'
    ? [config.frontendUrl]
    : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:8080'];
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        uptime: process.uptime()
    });
});
app.use('/api', routes);
app.get('/', (req, res) => {
    res.json({
        message: 'Omyra Project Management API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            projects: '/api/projects',
            tasks: '/api/tasks',
            team: '/api/team'
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});
app.use(errorHandler);
const startServer = async () => {
    try {
        await connectDatabase();
        console.log('📧 Initializing email service...');
        console.log('🔔 Initializing notification service...');
        notificationService.initialize(server);
        console.log('⏰ Task deadline reminder scheduler started');
        server.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📡 Environment: ${config.nodeEnv}`);
            console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
            console.log(`📚 API Documentation: http://localhost:${config.port}/api/health`);
            console.log(`🔔 WebSocket server ready for real-time notifications`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
