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
import { emailService } from './services/emailService.js';
import { notificationService } from './services/notificationService.js';

const app = express();
const server = createServer(app);

// Trust proxy in production
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Compression middleware for production
if (config.nodeEnv === 'production') {
  app.use(compression());
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 1000 : 100, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === 'OPTIONS',
});
app.use(limiter);

// CORS configuration
const corsOrigins = config.nodeEnv === 'production' 
  ? [config.frontendUrl]
  : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', routes);

// Root endpoint
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize email service
    console.log('📧 Initializing email service...');
    
    // Initialize real-time notification service
    console.log('🔔 Initializing notification service...');
    notificationService.initialize(server);
    
    // Start SMTP server for receiving emails (optional)
    // if (config.nodeEnv === 'development') {
    //   emailService.startSMTPServer(config.smtpPort);
    // }
    
    // Start task deadline reminder scheduler
    // emailService.startDeadlineReminders();
    console.log('⏰ Task deadline reminder scheduler started');
    
    // Set up email event listeners
    // emailService.on('emailSent', ({ message, result }: { message: any; result: any }) => {
    //   console.log(`✅ Email sent to ${message.to}: ${message.subject}`);
    // });
    
    // emailService.on('emailFailed', ({ message, error }: { message: any; error: any }) => {
    //   console.log(`❌ Failed to send email to ${message.to}: ${message.subject}`, error);
    // });
    
    // emailService.on('emailReceived', (email: any) => {
    //   console.log(`📧 Received email from ${email.from}: ${email.subject}`);
    // });
    
    // Start listening
    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api/health`);
      console.log(`🔔 WebSocket server ready for real-time notifications`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
