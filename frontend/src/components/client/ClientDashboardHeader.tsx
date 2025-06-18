import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building,
  Calendar,
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientDashboardStats } from '../../hooks/useClientDashboard';

const getInitials = (name: string | undefined | null) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

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

export const ClientDashboardHeader: React.FC = () => {
  const { profile, user } = useAuth();
  const { data: stats, isLoading } = useClientDashboardStats();

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

  const clientName = profile?.fullName || user?.email || 'Client';
  const companyName = 'Your Company'; // TODO: Add company to profile or fetch from API
  const lastLoginText = 'Welcome back!'; // TODO: Add lastLoginDate to profile or fetch from API

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Welcome Section */}
      <div className="lg:col-span-2">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
              <div className="absolute top-3/4 left-1/2 w-16 h-16 bg-indigo-300 rounded-full blur-xl"></div>
            </div>
          </div>
          
          <CardContent className="relative p-8 text-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-white text-gray-800 text-lg font-semibold">
                    {getInitials(clientName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {getGreeting()}, {clientName.split(' ')[0] || 'Client'}! {getTimeOfDayIcon()}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Welcome to your project dashboard
                  </p>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{companyName}</span>
                  </div>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                CLIENT
              </Badge>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                    {stats.totalProjects} Projects
                  </Badge>
                  <Badge variant="secondary" className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                    {stats.activeFeedbackCount} Active Requests
                  </Badge>
                  <Badge variant="secondary" className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                    Last login {lastLoginText}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Health Score */}
      <div>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Project Health</h3>
                  <p className="text-sm text-gray-500">Overall Status</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats?.overallHealth || 85}%
                </div>
                <div className="text-lg font-medium text-green-600 mb-4">
                  Excellent
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${stats?.overallHealth || 85}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">On Track Projects</span>
                  <span className="font-medium">{stats?.onTrackProjects || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed Milestones</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="font-medium">{stats?.completedMilestones || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Response Time</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">{stats?.avgResponseTime || '2h'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
