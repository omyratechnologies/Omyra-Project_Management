import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Activity,
  RefreshCw,
  FolderOpen,
  FileText,
  Users,
  Bell,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/hooks/useRBAC';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ClientDashboardStats,
  ClientProjectOverview,
  ClientRecentActivity,
  ClientFeedbackCenter,
  ClientNotificationCenter,
  ClientDashboardHeader,
  ClientAssignedDocuments
} from '@/components/client';

const ClientDashboard: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { profile } = useAuth();
  const rbac = useRBAC();
  const queryClient = useQueryClient();

  // Redirect non-clients away from this page
  if (profile?.role !== 'client') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-4">
              This page is only accessible to client users.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {/* Client Dashboard Header */}
      <ClientDashboardHeader />
      
      {/* Key Metrics Cards */}
      <ClientDashboardStats />
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Refresh and Last Updated */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Overview - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <ClientProjectOverview />
              <ClientAssignedDocuments limit={3} />
            </div>
            
            {/* Notifications - Takes 1 column */}
            <div>
              <ClientNotificationCenter />
            </div>
          </div>
          
          {/* Recent Activity */}
          <ClientRecentActivity />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <ClientProjectOverview detailed={true} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <ClientAssignedDocuments limit={20} />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <ClientFeedbackCenter />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ClientRecentActivity detailed={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
