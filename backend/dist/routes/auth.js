import { Router } from 'express';
import { register, login, getProfile, updateProfile, updatePassword, updatePreferences, getPreferences, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { createUserSchema, loginSchema } from '../utils/validation.js';
const router = Router();
router.post('/register', validateBody(createUserSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);
export default router;
//# sourceMappingURL=auth.js.map