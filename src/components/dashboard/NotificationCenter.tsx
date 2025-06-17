import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  User,
  FolderOpen,
  Target,
  TrendingUp,
  MessageCircle,
  X,
  BellRing,
  CheckCheck,
  Eye,
  ArrowRight
} from "lucide-react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    isLoading 
  } = useRealTimeNotifications();
  const [showAll, setShowAll] = useState(false);

  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <Target className="w-4 h-4" />;
      case 'task_due':
      case 'deadline_approaching':
        return <Clock className="w-4 h-4" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'project_update':
      case 'project_milestone':
        return <FolderOpen className="w-4 h-4" />;
      case 'team_mention':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-l-4 border-l-red-500 bg-red-50/50';
    
    switch (type) {
      case 'task_assigned':
        return 'border-l-4 border-l-blue-500 bg-blue-50/50';
      case 'task_due':
      case 'deadline_approaching':
        return 'border-l-4 border-l-orange-500 bg-orange-50/50';
      case 'task_completed':
        return 'border-l-4 border-l-green-500 bg-green-50/50';
      case 'project_update':
      case 'project_milestone':
        return 'border-l-4 border-l-purple-500 bg-purple-50/50';
      case 'team_mention':
        return 'border-l-4 border-l-indigo-500 bg-indigo-50/50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50/50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs bg-orange-100 text-orange-800 border-orange-300">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellRing className="w-5 h-5 text-blue-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </div>
            <span className="text-lg font-semibold">Notifications</span>
          </div>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {urgentCount} urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No new notifications</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="space-y-3 pr-4">
                {displayNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`group relative p-4 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer ${
                      getNotificationColor(notification.type, notification.priority)
                    } ${!notification.read ? 'ring-2 ring-blue-100' : 'opacity-75'}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        notification.priority === 'urgent' ? 'bg-red-100' :
                        notification.priority === 'high' ? 'bg-orange-100' :
                        notification.priority === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title}
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
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                            {notification.project && (
                              <>
                                <span>•</span>
                                <FolderOpen className="w-3 h-3" />
                                <span className="truncate max-w-24">{notification.project}</span>
                              </>
                            )}
                            {notification.user && (
                              <>
                                <span>•</span>
                                <User className="w-3 h-3" />
                                <span className="truncate max-w-20">{notification.user}</span>
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
                                console.log('Action clicked:', notification.action, notification.link);
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
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={markAllAsRead}
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 5 && (
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
