import { Router } from 'express';
import { getCompanySettings, updateCompanySettings } from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';
const router = Router();
router.get('/settings', authenticate, isAdmin, getCompanySettings);
router.put('/settings', authenticate, isAdmin, updateCompanySettings);
export default router;
