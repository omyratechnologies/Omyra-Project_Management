import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { ModernAnalyticsDashboard } from "@/components/dashboard/ModernAnalyticsDashboard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { TeamActivity } from "@/components/dashboard/TeamActivity";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Clock,
  Target,
  Users,
  Activity,
  BellRing,
  Zap,
  Sparkles,
  Settings
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useNotifications } from "@/hooks/useNotifications";

const Index = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { unreadCount } = useNotifications();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Welcome Message and Quick Stats */}
      <DashboardHeader />
      
      {/* Key Metrics Cards */}
      <DashboardCards />
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="w-4 h-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 hidden sm:block">
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectOverview />
            <RecentActivity />
          </div>
          <TeamActivity />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ModernAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RecentActivity />
              <TeamActivity />
            </div>
            
            <div className="space-y-6">
              {/* Quick Action Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Create New Task
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                  </Button>
                </CardContent>
              </Card>
              
              {/* Summary Stats */}
              {analyticsLoading ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>Today's Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : analytics && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>Today's Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                      <span className="text-lg font-bold text-green-600">
                        {analytics.personal?.myTasks?.completed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Active Projects</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analytics.overview?.activeProjects || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Team Members</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analytics.overview?.teamMembers || 0}
                      </span>
                    </div>
                    {(analytics.personal?.myTasks?.overdue || 0) > 0 && (
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Overdue Tasks</span>
                        <span className="text-lg font-bold text-red-600">
                          {analytics.personal?.myTasks?.overdue || 0}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NotificationCenter />
            
            {/* Notification Settings */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <BellRing className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">Notification Settings</h3>
                  <p className="text-sm">Configure how you want to receive notifications</p>
                  <Button variant="outline" className="mt-4" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
