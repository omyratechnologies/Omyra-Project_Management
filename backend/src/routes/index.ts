import { Router } from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import teamRoutes from './team.js';
import companyRoutes from './company.js';
import emailRoutes from './email.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/team', teamRoutes);
router.use('/company', companyRoutes);
router.use('/email', emailRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Omyra Project Management API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
