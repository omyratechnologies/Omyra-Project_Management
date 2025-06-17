
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
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
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { unreadCount } = useRealTimeNotifications();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 1000); // Add slight delay for UX
  };

  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fde8] flex w-full">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Dashboard Header with Welcome Message and Quick Stats */}
            <DashboardHeader />
            
            {/* Key Metrics Cards */}
            <DashboardCards />
            
            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center space-x-2">
                    <BellRing className="w-4 h-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 hover:shadow-md transition-shadow"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
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

                    {/* Productivity Tips */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <span>Productivity Tips</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-2">Today's Focus:</p>
                          <ul className="space-y-1 text-xs text-gray-600">
                            <li>• Prioritize urgent tasks first</li>
                            <li>• Take regular breaks every hour</li>
                            <li>• Update project status regularly</li>
                            <li>• Communicate with team members</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <NotificationCenter />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
