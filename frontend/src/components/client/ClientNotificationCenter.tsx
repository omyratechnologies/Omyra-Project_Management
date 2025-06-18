import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell,
  BellRing,
  Check,
  X,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info,
  Users,
  Eye,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { safeFormatDistanceToNow } from '@/utils/dateUtils';

interface ClientNotificationCenterProps {
  compact?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'project_update':
      return <TrendingUp className="w-4 h-4" />;
    case 'feedback_response':
      return <MessageSquare className="w-4 h-4" />;
    case 'meeting_reminder':
      return <Calendar className="w-4 h-4" />;
    case 'task_assigned':
    case 'task_due':
      return <CheckCheck className="w-4 h-4" />;
    case 'task_completed':
      return <Check className="w-4 h-4" />;
    case 'project_milestone':
      return <TrendingUp className="w-4 h-4" />;
    case 'system_alert':
      return <AlertTriangle className="w-4 h-4" />;
    case 'general':
      return <Info className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  const baseColor = priority === 'urgent' ? 'bg-red-50 border-red-200' :
                   priority === 'high' ? 'bg-orange-50 border-orange-200' :
                   priority === 'medium' ? 'bg-blue-50 border-blue-200' :
                   'bg-gray-50 border-gray-200';
  
  return baseColor;
};

const getPriorityBadge = (priority: string) => {
  const colors = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge className={`${colors[priority as keyof typeof colors]} text-xs border-0`}>
      {priority}
    </Badge>
  );
};

export const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({ 
  compact = false 
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading 
  } = useNotifications();
  const [showAll, setShowAll] = React.useState(false);

  const displayNotifications = compact && !showAll 
    ? notifications.slice(0, 3) 
    : notifications;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRemoveNotification = (id: string) => {
    deleteNotification(id);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-64 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-blue-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </div>
                )}
              </div>
              <span>Notifications</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No new notifications</p>
          </div>
        ) : (
          <>
            <ScrollArea className={compact ? "h-64" : "h-96"}>
              <div className="space-y-3 pr-4">
                {displayNotifications
                  .filter(notification => notification && notification.id) // Filter out null/undefined notifications
                  .map((notification) => (
                  <div 
                    key={notification.id}
                    className={`group relative p-4 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer border ${
                      getNotificationColor(notification.type, notification.priority)
                    } ${!notification.read ? 'ring-2 ring-blue-100' : 'opacity-75'}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        notification.priority === 'urgent' ? 'bg-red-100' :
                        notification.priority === 'high' ? 'bg-orange-100' :
                        notification.priority === 'medium' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title || 'Untitled Notification'}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(notification.priority)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {notification.message || 'No message available'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{safeFormatDistanceToNow(notification.timestamp)}</span>
                            {notification.metadata?.projectId && (
                              <>
                                <span>•</span>
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-24">Project</span>
                              </>
                            )}
                          </div>
                          
                          {notification.actionable && notification.action && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-7 px-3 bg-white/50 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle action click - could navigate to specific page
                                if (notification.link) {
                                  window.location.href = notification.link;
                                }
                              }}
                            >
                              {notification.action}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {compact && notifications.length > 3 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {notifications.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => setShowAll(!showAll)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {showAll ? 'Show less' : `Show all (${notifications.length})`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
