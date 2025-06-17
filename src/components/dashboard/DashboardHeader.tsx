import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Zap,
  Award,
  Calendar,
  Clock,
  Users,
  Activity,
  Sparkles
} from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export const DashboardHeader = () => {
  const { analytics, isLoading } = useDashboardAnalytics();
  const { profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', icon: <Sparkles className="w-4 h-4" /> };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Target className="w-4 h-4" /> };
    if (score >= 40) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Activity className="w-4 h-4" /> };
    return { level: 'Needs Focus', color: 'text-red-600', bg: 'bg-red-100', icon: <Clock className="w-4 h-4" /> };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="h-48 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />
        </div>
        <div>
          <Card className="h-48 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />
        </div>
      </div>
    );
  }

  const productivityInfo = getProductivityLevel(analytics.performance.productivityScore);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Welcome Section */}
      <div className="lg:col-span-2">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br bg-gray-50 from-white to-blue-50/30">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
              <div className="absolute top-3/4 left-1/2 w-16 h-16 bg-pink-300 rounded-full blur-xl"></div>
            </div>
          </div>
          
          <CardContent className="relative p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-3 border-white/20 shadow-lg">
                  <AvatarFallback className="bg-white/10 text-black text-lg font-semibold backdrop-blur-sm">
                    {profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getTimeOfDayIcon()}</span>
                    <h1 className="text-2xl text-black font-bold">
                      {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'User'}!
                    </h1>
                  </div>
                  <p className="text-black text-lg">
                    Ready to tackle your goals today?
                  </p>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-black/20 backdrop-blur-sm text-black border-white/20 backdrop-blur-sm">
                {profile?.role?.replace('_', ' ').toUpperCase() || 'USER'}
              </Badge>
            </div>


            {/* Insights */}
            {analytics.insights.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {analytics.insights.slice(0, 2).map((insight, index) => (
                    <Badge 
                      key={index}
                      variant={insight.type === 'warning' ? 'destructive' : insight.type === 'success' ? 'default' : 'secondary'}
                      className={`${
                        insight.type === 'warning' ? 'bg-red-100 text-red-800 border-red-200' :
                        insight.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      } text-xs`}
                    >
                      {insight.title}: {insight.message}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Productivity Score */}
      <div>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${productivityInfo.bg}`}>
                  <div className={productivityInfo.color}>
                    {productivityInfo.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Productivity</h3>
                  <p className="text-sm text-gray-500">Overall Score</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {analytics.performance.productivityScore}%
                </div>
                <div className={`text-lg font-medium ${productivityInfo.color} mb-4`}>
                  {productivityInfo.level}
                </div>
                <Progress 
                  value={analytics.performance.productivityScore} 
                  className="w-full h-3 mb-4"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Velocity Trend</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(analytics.performance.velocityTrend)}
                    <span className="font-medium">
                      {analytics.performance.velocityTrend === 'up' ? 'Improving' :
                       analytics.performance.velocityTrend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="font-medium">{analytics.performance.efficiencyRating}%</span>
                </div>

                {analytics.personal.productivity.focusTime > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Focus Time</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="font-medium">{analytics.personal.productivity.focusTime}h</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Badge */}
            {analytics.performance.weeklyTaskCompletion >= 5 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Great week! {analytics.performance.weeklyTaskCompletion} tasks completed
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
