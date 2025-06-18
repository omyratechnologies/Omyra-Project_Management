import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { NotificationController } from '../controllers/notificationController.js';
const router = Router();
// Apply authentication middleware to all routes
router.use(authenticate);
// Get user's notifications with pagination and filtering
router.get('/', NotificationController.getNotifications);
// Get notification summary (unread count and recent notifications)
router.get('/summary', NotificationController.getNotificationSummary);
// Mark specific notification as read
router.patch('/:notificationId/read', NotificationController.markAsRead);
// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);
// Delete specific notification
router.delete('/:notificationId', NotificationController.deleteNotification);
// Clear all notifications
router.delete('/', NotificationController.clearAllNotifications);
// Get notification preferences
router.get('/preferences', NotificationController.getNotificationPreferences);
// Update notification preferences
router.put('/preferences', NotificationController.updateNotificationPreferences);
// Send test notification (admin only)
router.post('/test', NotificationController.sendTestNotification);
// Get notification statistics (admin only)
router.get('/stats', NotificationController.getNotificationStats);
// Broadcast notification to all users (admin only)
router.post('/broadcast', NotificationController.broadcastNotification);
export default router;
//# sourceMappingURL=notifications.js.map