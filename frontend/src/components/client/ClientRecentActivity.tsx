import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity,
  Clock,
  MessageSquare,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { useClientRecentActivity } from '@/hooks/useClientDashboard';
import { formatDistanceToNow } from 'date-fns';
import { safeFormatDistanceToNow } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientRecentActivityProps {
  detailed?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'project_update':
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    case 'feedback_response':
      return <MessageSquare className="w-4 h-4 text-green-600" />;
    case 'task_completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'document_shared':
      return <FileText className="w-4 h-4 text-purple-600" />;
    case 'meeting_scheduled':
      return <Calendar className="w-4 h-4 text-orange-600" />;
    case 'team_update':
      return <Users className="w-4 h-4 text-indigo-600" />;
    case 'milestone_reached':
      return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    default:
      return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'project_update':
      return 'bg-blue-50 border-blue-200';
    case 'feedback_response':
      return 'bg-green-50 border-green-200';
    case 'task_completed':
      return 'bg-emerald-50 border-emerald-200';
    case 'document_shared':
      return 'bg-purple-50 border-purple-200';
    case 'meeting_scheduled':
      return 'bg-orange-50 border-orange-200';
    case 'team_update':
      return 'bg-indigo-50 border-indigo-200';
    case 'milestone_reached':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const ActivityItem: React.FC<{ activity: any; isLast: boolean }> = ({ activity, isLast }) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
      )}
      
      <div className="flex items-start space-x-4 pb-6">
        {/* Activity Icon */}
        <div className={`p-3 rounded-full border-2 ${getActivityColor(activity.type)} flex-shrink-0`}>
          {getActivityIcon(activity.type)}
        </div>
        
        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-gray-900">
                {activity.title}
              </h4>
              {activity.priority && (
                <Badge variant="secondary" className="text-xs">
                  {activity.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{safeFormatDistanceToNow(activity.date)}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {activity.description}
          </p>
          
          {/* Activity Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {activity.user && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{activity.user}</span>
              </div>
            )}
            {activity.project && (
              <div className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-32">{activity.project}</span>
              </div>
            )}
            {activity.status && (
              <Badge 
                variant={activity.status === 'completed' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {activity.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientRecentActivity: React.FC<ClientRecentActivityProps> = ({ 
  detailed = false 
}) => {
  const { data: activities, isLoading } = useClientRecentActivity();

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
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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

  if (!activities || activities.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-gray-600">
            Your project activity will appear here as work progresses.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayActivities = detailed ? activities : activities.slice(0, 5);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Latest updates from your projects
            </p>
          </div>
          
          {!detailed && activities.length > 5 && (
            <div className="text-sm text-blue-600 font-medium">
              +{activities.length - 5} more
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-0">
          {displayActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id || index} 
              activity={activity} 
              isLast={index === displayActivities.length - 1}
            />
          ))}
        </div>

        {!detailed && activities.length > 5 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
