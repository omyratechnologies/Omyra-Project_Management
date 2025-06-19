# Notification System Developer Guide

## Quick Start for Developers

This guide helps developers understand how to extend and maintain the notification system in Omyra Project Nexus.

## Adding New Notification Types

### Step 1: Define the Notification Type
Add your new notification type to the type definitions:

```typescript
// backend/src/types/index.ts
export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'project_created'
  | 'meeting_invitation'
  | 'feedback_received'
  | 'feedback_response'
  | 'deadline_reminder'
  | 'system_announcement'
  | 'your_new_type';  // Add here
```

### Step 2: Add Trigger Logic
Add notification triggers in the relevant controller:

```typescript
// Example: In a controller method
import { notificationService } from '../services/notificationService.js';

// Inside your controller method
await notificationService.sendNotification({
  userId: targetUserId,
  type: 'your_new_type',
  title: 'Your Notification Title',
  message: 'Detailed message about the event',
  priority: 'medium', // low, medium, high, urgent
  actionable: true,
  action: 'View Details',
  link: '/path/to/resource',
  metadata: {
    // Any additional data specific to your notification
    resourceId: resource.id,
    customField: 'value'
  }
});
```

### Step 3: Update User Preferences (Optional)
If you want users to control this notification type:

```typescript
// Update the default preferences structure
const defaultPreferences = {
  email: {
    taskAssigned: true,
    taskDue: true,
    projectUpdates: true,
    meetingReminders: true,
    feedbackResponse: true,
    systemAlerts: true,
    yourNewType: true  // Add here
  },
  push: {
    // Same structure as email
    yourNewType: true
  },
  realTime: {
    enabled: true,
    sound: true,
    desktop: true
  }
};
```

### Step 4: Update Frontend UI (Optional)
Add controls in the Settings page for the new notification type:

```typescript
// In Settings.tsx or notification preferences component
<div className="flex items-center justify-between">
  <div>
    <label className="text-sm font-medium">Your New Notification</label>
    <p className="text-sm text-muted-foreground">
      Description of when this notification is sent
    </p>
  </div>
  <Switch
    checked={preferences?.email.yourNewType}
    onCheckedChange={(checked) =>
      handlePreferenceChange('email', 'yourNewType', checked)
    }
  />
</div>
```

## Adding Automated Notifications

### Step 1: Create a Scheduler Function
```typescript
// backend/src/services/notificationService.ts
// Add to the NotificationService class

private scheduleYourCustomReminder() {
  // Example: Daily check at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      // Your logic to find relevant items
      const itemsRequiringNotification = await YourModel.find({
        // Your criteria
      });

      for (const item of itemsRequiringNotification) {
        await this.sendNotification({
          userId: item.userId,
          type: 'your_custom_reminder',
          title: 'Custom Reminder',
          message: `Don't forget about: ${item.title}`,
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Custom reminder scheduler error:', error);
    }
  });
}
```

### Step 2: Initialize the Scheduler
Add the scheduler initialization in the notification service constructor:

```typescript
constructor() {
  // ... existing code ...
  this.scheduleYourCustomReminder();
}
```

## Testing Notifications

### Backend Testing
```typescript
// Test endpoint to send sample notifications
// Add to notificationController.ts or create a test controller

static async sendSampleNotification(req: AuthenticatedRequest, res: Response) {
  if (process.env.NODE_ENV !== 'development') {
    return errorResponse(res, 'Test endpoints only available in development', undefined, 403);
  }

  await notificationService.sendNotification({
    userId: req.user.id,
    type: 'your_new_type',
    title: 'Test Notification',
    message: 'This is a test of your new notification type',
    priority: 'medium',
    actionable: true,
    action: 'Test Action',
    link: '/test'
  });

  return successResponse(res, 'Test notification sent');
}
```

### Frontend Testing
Use the browser console to test notification handling:

```javascript
// In browser console (when app is running)
// Test notification reception
window.notificationService?.testConnection();

// Manually trigger a notification for testing
fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});
```

## Debugging Common Issues

### WebSocket Connection Issues
1. Check browser Network tab for WebSocket connections
2. Verify JWT token in localStorage
3. Check CORS settings in server configuration
4. Test with REST API fallback

```typescript
// Debug connection status
const { isConnected, isLoading } = useNotifications();
console.log('Notification service status:', { isConnected, isLoading });
```

### Notification Not Triggering
1. Verify the notification service is properly imported
2. Check if the trigger code is actually executed
3. Verify user preferences allow the notification type
4. Check server logs for errors

```typescript
// Add debug logging to your trigger
console.log('About to send notification:', {
  userId: targetUserId,
  type: 'your_type',
  title: 'Your Title'
});

await notificationService.sendNotification({...});

console.log('Notification sent successfully');
```

### Performance Issues
1. Monitor notification queue size
2. Check MongoDB query performance
3. Review WebSocket connection counts
4. Optimize notification metadata size

## Best Practices

### 1. Notification Content
- Keep titles concise (< 50 characters)
- Make messages actionable and clear
- Use appropriate priority levels
- Include relevant metadata for context

### 2. User Experience
- Don't spam users with notifications
- Provide clear opt-out mechanisms
- Group related notifications when possible
- Use actionable notifications with clear CTAs

### 3. Performance
- Batch notifications when possible
- Use appropriate database indexes
- Limit metadata size
- Clean up old notifications regularly

### 4. Error Handling
- Always wrap notification sending in try-catch
- Log notification failures for debugging
- Provide fallback mechanisms
- Handle WebSocket disconnections gracefully

## Code Patterns

### Conditional Notifications
```typescript
// Check user preferences before sending
const profile = await Profile.findOne({ user: userId });
const preferences = profile?.notificationPreferences;

if (preferences?.email?.yourNotificationType) {
  await notificationService.sendNotification({
    // notification details
  });
}
```

### Bulk Notifications
```typescript
// For multiple users
const userIds = [user1.id, user2.id, user3.id];
const notificationPromises = userIds.map(userId =>
  notificationService.sendNotification({
    userId,
    type: 'bulk_notification',
    title: 'Bulk Update',
    message: 'This affects multiple users'
  })
);

await Promise.all(notificationPromises);
```

### Notification with Rich Metadata
```typescript
await notificationService.sendNotification({
  userId: user.id,
  type: 'complex_notification',
  title: 'Complex Event',
  message: 'Something complex happened',
  priority: 'high',
  metadata: {
    projectId: project.id,
    taskId: task.id,
    customData: {
      previousStatus: 'draft',
      newStatus: 'in_progress',
      assignedBy: assigningUser.name
    },
    actions: [
      { label: 'View Project', url: `/projects/${project.id}` },
      { label: 'View Task', url: `/tasks/${task.id}` }
    ]
  }
});
```

## Maintenance Tasks

### Regular Cleanup
The system automatically cleans up old notifications via MongoDB TTL, but you can also implement manual cleanup:

```typescript
// Clean up old notifications (30 days)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await Notification.deleteMany({
  createdAt: { $lt: thirtyDaysAgo },
  read: true
});
```

### Monitor Connection Health
```typescript
// Get connection statistics
const stats = notificationService.getConnectionStats();
console.log('Connected users:', stats.connectedUsers);
console.log('Total connections:', stats.totalConnections);
```

### Database Indexing
Ensure proper indexes exist for notification queries:

```javascript
// MongoDB indexes (run in MongoDB shell or migration)
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ type: 1 });
db.notifications.createIndex({ priority: 1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
```

---

This guide covers the most common scenarios for extending the notification system. For more complex use cases, refer to the existing code and the main documentation file.
