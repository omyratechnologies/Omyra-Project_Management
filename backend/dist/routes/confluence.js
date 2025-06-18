import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isNotClient } from '../middleware/rbac.js';
import { createConfluencePage, getConfluencePages, getConfluencePage, updateConfluencePage, deleteConfluencePage, getPageVersions } from '../controllers/confluenceController.js';
const router = Router();
// Create confluence page (not clients)
router.post('/pages', authenticate, isNotClient, createConfluencePage);
// Get confluence pages
router.get('/pages', authenticate, getConfluencePages);
// Get specific confluence page
router.get('/pages/:pageId', authenticate, getConfluencePage);
// Update confluence page
router.put('/pages/:pageId', authenticate, updateConfluencePage);
// Delete confluence page
router.delete('/pages/:pageId', authenticate, deleteConfluencePage);
// Get page versions
router.get('/pages/:pageId/versions', authenticate, getPageVersions);
export default router;
//# sourceMappingURL=confluence.js.map