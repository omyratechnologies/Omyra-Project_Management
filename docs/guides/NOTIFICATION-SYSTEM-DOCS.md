# Omyra Project Nexus - Real-Time Notification System

## Overview

The Omyra Project Nexus application features a comprehensive real-time notification system built with Socket.IO that provides instant updates to users across the platform. The system supports multiple notification types, user preferences, and both real-time and REST API access.

## Architecture

### Backend Components

1. **Notification Model** (`backend/src/models/Notification.ts`)
   - MongoDB document schema for storing notifications
   - Supports metadata, priorities, TTL, and user-specific filtering

2. **Notification Service** (`backend/src/services/notificationService.ts`)
   - Core service handling real-time WebSocket connections
   - Queue management for reliable message delivery
   - Email notification integration
   - Broadcasting capabilities

3. **Notification Controller** (`backend/src/controllers/notificationController.ts`)
   - REST API endpoints for notification CRUD operations
   - User preference management
   - Admin statistics and broadcasting

4. **WebSocket Integration** (`backend/src/server.ts`)
   - Socket.IO server setup with authentication
   - Real-time connection management

### Frontend Components

1. **Notification Service** (`frontend/src/services/notificationService.ts`)
   - WebSocket client connection management
   - Real-time event handling
   - Fallback to REST API when disconnected

2. **Notification Hook** (`frontend/src/hooks/useNotifications.ts`)
   - React hook for notification state management
   - Auto-reconnection and error handling
   - Integration with authentication context

3. **UI Components**
   - `NotificationCenter.tsx` - Main notification display
   - `ClientNotificationCenter.tsx` - Client-specific notifications
   - Settings integration for user preferences

## Features

### Real-Time Notifications
- ✅ Instant delivery via WebSocket
- ✅ Auto-reconnection on connection loss
- ✅ Fallback to REST API polling
- ✅ Connection status indicators

### Notification Types
- ✅ Task assignments and updates
- ✅ Project status changes
- ✅ Meeting invitations and reminders
- ✅ Client feedback notifications
- ✅ System alerts and announcements
- ✅ Deadline reminders (automated)

### User Preferences
- ✅ Email notification settings
- ✅ Push notification controls
- ✅ Real-time notification preferences
- ✅ Per-notification-type granular control

### Admin Features
- ✅ Broadcast notifications to all users
- ✅ Notification statistics and analytics
- ✅ Test notification capabilities
- ✅ User connection monitoring

## API Endpoints

### User Endpoints

#### Get Notifications
```
GET /api/notifications
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- unreadOnly: boolean (default: false)
- type: string (optional filter)
- priority: string (optional filter)
```

#### Get Notification Summary
```
GET /api/notifications/summary
Returns: { unreadCount, recentNotifications }
```

#### Mark Notification as Read
```
PUT /api/notifications/:notificationId/read
```

#### Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
```

#### Delete Notification
```
DELETE /api/notifications/:notificationId
```

#### Clear All Notifications
```
DELETE /api/notifications/clear-all
```

#### Get Notification Preferences
```
GET /api/notifications/preferences
```

#### Update Notification Preferences
```
PUT /api/notifications/preferences
Body: { preferences: NotificationPreferences }
```

### Admin Endpoints

#### Get Notification Statistics
```
GET /api/notifications/stats
Requires: Admin role
Returns: { totalNotifications, unreadNotifications, urgentNotifications, todayNotifications, connectedUsers }
```

#### Broadcast Notification
```
POST /api/notifications/broadcast
Requires: Admin role
Body: { type, title, message, priority?, actionable?, action?, link? }
```

#### Send Test Notification
```
POST /api/notifications/test
Requires: Admin role
```

## WebSocket Events

### Client Events (Frontend → Backend)
- `join` - Join user-specific room for notifications
- `leave` - Leave notification room
- `mark_read` - Mark notification as read
- `get_summary` - Request notification summary

### Server Events (Backend → Frontend)
- `notification` - New notification received
- `notification_read` - Notification marked as read
- `notification_deleted` - Notification deleted
- `bulk_update` - Multiple notifications updated
- `connection_status` - Connection status updates

## Usage Examples

### Frontend Integration

#### Basic Hook Usage
```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  return (
    <div>
      <div>Unread: {unreadCount}</div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {notifications.map(notification => (
        <div key={notification._id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification._id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### Notification Preferences
```typescript
import { useNotifications } from '@/hooks/useNotifications';

function NotificationSettings() {
  const { preferences, updatePreferences } = useNotifications();

  const handlePreferenceChange = async (newPreferences) => {
    await updatePreferences(newPreferences);
  };

  return (
    <div>
      <h2>Notification Preferences</h2>
      <label>
        <input
          type="checkbox"
          checked={preferences?.email.taskAssigned}
          onChange={(e) => handlePreferenceChange({
            ...preferences,
            email: {
              ...preferences.email,
              taskAssigned: e.target.checked
            }
          })}
        />
        Email notifications for task assignments
      </label>
      {/* More preference controls */}
    </div>
  );
}
```

### Backend Integration

#### Sending Notifications
```typescript
import { notificationService } from '../services/notificationService';

// Send notification to specific user
await notificationService.sendNotification({
  userId: user.id,
  type: 'task_assigned',
  title: 'New Task Assigned',
  message: `You have been assigned to task: ${task.title}`,
  priority: 'high',
  actionable: true,
  action: 'View Task',
  link: `/tasks/${task.id}`,
  metadata: {
    taskId: task.id,
    projectId: task.projectId
  }
});

// Broadcast to all users
await notificationService.broadcastToAll({
  type: 'system_announcement',
  title: 'System Maintenance',
  message: 'Scheduled maintenance tonight from 2-4 AM EST',
  priority: 'urgent'
});
```

## Notification Types and Triggers

### Automatic Triggers

1. **Task Management**
   - Task assignment/reassignment
   - Task completion
   - Task deadline approaching (automated scheduler)

2. **Project Updates**
   - Project creation
   - Project status changes
   - New project member added

3. **Meeting Management**
   - Meeting invitations sent
   - Meeting reminders (automated)

4. **Client Feedback**
   - New feedback received
   - Feedback responses posted

5. **System Events**
   - User role changes
   - Security alerts
   - System announcements

### Manual Triggers
- Admin broadcasts
- Test notifications
- Custom integrations

## Configuration

### Environment Variables
```env
# Backend (.env)
FRONTEND_URL=http://localhost:8080
EMAIL_SERVICE_ENABLED=true

# Frontend (.env)
VITE_API_URL=http://localhost:5001
VITE_WS_URL=http://localhost:5001
```

### Socket.IO Configuration
- **Connection Timeout**: 10 seconds
- **Reconnection Attempts**: 5
- **Reconnection Delay**: 1-5 seconds (exponential backoff)
- **Transport**: WebSocket with polling fallback

## Monitoring and Debugging

### Connection Status
- Frontend provides real-time connection status
- Auto-reconnection with visual indicators
- Fallback to REST API when WebSocket unavailable

### Logging
- Server logs all notification events
- Client logs connection status changes
- Error tracking for failed deliveries

### Admin Dashboard
- Real-time connection statistics
- Notification delivery metrics
- User preference analytics

## Performance Considerations

### Scalability
- MongoDB TTL indexes for automatic cleanup
- Efficient querying with proper indexing
- Connection pooling for WebSocket management

### Optimization
- Pagination for notification lists
- Selective loading of notification metadata
- Debounced preference updates

### Memory Management
- Automatic cleanup of expired notifications
- Connection limit management
- Queue size limitations

## Security

### Authentication
- JWT token validation for WebSocket connections
- User-specific notification rooms
- Admin-only endpoints protected

### Data Protection
- User notifications are private and isolated
- No cross-user data leakage
- Secure WebSocket transport

### Rate Limiting
- Notification sending rate limits
- Connection attempt throttling
- API endpoint rate limiting

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS settings
   - Verify JWT token validity
   - Ensure WebSocket transport is enabled

2. **Notifications Not Received**
   - Check user preferences
   - Verify notification service is running
   - Test with REST API fallback

3. **High Memory Usage**
   - Check notification cleanup schedule
   - Monitor connection counts
   - Review TTL settings

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` and checking browser console for WebSocket events.

## Future Enhancements

### Planned Features
- [ ] Push notifications for mobile devices
- [ ] Notification templates system
- [ ] Advanced filtering and search
- [ ] Notification scheduling
- [ ] Integration with external services (Slack, Teams)
- [ ] A/B testing for notification effectiveness

### Performance Improvements
- [ ] Redis integration for horizontal scaling
- [ ] WebSocket clustering support
- [ ] Advanced caching strategies
- [ ] Bulk notification optimizations

---

*This documentation is maintained as part of the Omyra Project Nexus development. Please update it when making changes to the notification system.*
