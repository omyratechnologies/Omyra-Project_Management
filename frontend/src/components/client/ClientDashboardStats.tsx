import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FolderOpen, 
  MessageSquare, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useClientDashboardStats } from '@/hooks/useClientDashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  iconBg: string;
  trend?: {
    type: 'up' | 'down' | 'same';
    value: number;
  };
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  bgColor, 
  iconBg, 
  trend, 
  description 
}) => {
  const getTrendIcon = (trend?: { type: 'up' | 'down' | 'same'; value: number }) => {
    if (!trend || trend.value === 0) return null;
    
    switch (trend.type) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: { type: 'up' | 'down' | 'same'; value: number }) => {
    if (!trend || trend.value === 0) return "text-gray-500";
    
    switch (trend.type) {
      case 'up':
        return "text-green-600";
      case 'down':
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className={`p-6 ${bgColor} relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-white/10"></div>
          </div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {title}
                </p>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trend)}
                  {trend && trend.value > 0 && (
                    <span className={`text-xs font-medium ${getTrendColor(trend)}`}>
                      {trend.type === 'up' ? '+' : '-'}{trend.value} this week
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900">
                {value}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {subtitle}
              </p>
              <p className="text-xs text-gray-500">
                {description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ClientDashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useClientDashboardStats();

  if (isLoading) {
    return (
      <div data-tour="client-dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-200">
            <CardContent className="p-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div data-tour="client-dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Unable to load dashboard statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      subtitle: `${stats.activeProjects} active`,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      trend: { type: 'same' as const, value: 0 },
      description: "Projects assigned to you"
    },
    {
      title: "Active Feedback",
      value: stats.activeFeedbackCount,
      subtitle: `${stats.feedbackSubmitted} total submitted`,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500",
      trend: { type: 'same' as const, value: 0 },
      description: "Pending feedback requests"
    },
    {
      title: "Meetings Attended",
      value: stats.meetingsAttended,
      subtitle: "This month",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      trend: { type: 'same' as const, value: 0 },
      description: "Project meetings joined"
    },
    {
      title: "Project Health",
      value: `${stats.overallHealth}%`,
      subtitle: "Average across projects",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      trend: { type: 'same' as const, value: 0 },
      description: "Overall project performance"
    }
  ];

  return (
    <div data-tour="client-dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
