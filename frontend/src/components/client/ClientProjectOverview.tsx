import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Pause,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Target,
  Star
} from 'lucide-react';
import { useClientProjects, ClientProject } from '@/hooks/useClientDashboard';
import { formatDistanceToNow } from 'date-fns';
import { safeFormatDistanceToNow } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientProjectOverviewProps {
  detailed?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'in progress':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'on hold':
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'in progress':
      return <TrendingUp className="w-3 h-3" />;
    case 'completed':
      return <CheckCircle2 className="w-3 h-3" />;
    case 'on hold':
    case 'paused':
      return <Pause className="w-3 h-3" />;
    case 'cancelled':
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <FolderOpen className="w-3 h-3" />;
  }
};

const getHealthColor = (health: number) => {
  if (health >= 80) return 'text-green-600';
  if (health >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getHealthBg = (health: number) => {
  if (health >= 80) return 'bg-green-500';
  if (health >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const ProjectCard: React.FC<{ project: ClientProject; detailed?: boolean }> = ({ 
  project, 
  detailed = false 
}) => {
  const daysUntilDeadline = project.endDate 
    ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const activeMilestones = project.milestones?.filter(m => m.status === 'active').length || 0;
  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <Badge className={`${getStatusColor(project.status)} border text-xs`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(project.status)}
                    <span>{project.status}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {project.description}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Timeline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Health Score & Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Health</span>
              </div>
              <span className={`text-sm font-semibold ${getHealthColor(project.health)}`}>
                {project.health}%
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Milestones</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {completedMilestones}/{project.milestones?.length || 0}
              </span>
            </div>
          </div>

          {/* Team & Timeline */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{project.members?.length || 0} members</span>
              </div>
              {daysUntilDeadline !== null && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className={daysUntilDeadline < 7 ? 'text-red-600' : ''}>
                    {daysUntilDeadline > 0 
                      ? `${daysUntilDeadline} days left`
                      : daysUntilDeadline === 0 
                        ? 'Due today'
                        : `${Math.abs(daysUntilDeadline)} days overdue`
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              Updated {safeFormatDistanceToNow(project.updatedAt)}
            </div>
          </div>

          {/* Manager Info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {project.manager?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PM'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {project.manager?.fullName || 'Project Manager'}
                  </p>
                  <p className="text-xs text-gray-500">Project Manager</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ClientProjectOverview: React.FC<ClientProjectOverviewProps> = ({ 
  detailed = false 
}) => {
  const { data: projects, isLoading } = useClientProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) || [];

  const activeProjects = projects?.filter(p => p.status.toLowerCase() === 'active').length || 0;
  const completedProjects = projects?.filter(p => p.status.toLowerCase() === 'completed').length || 0;
  const averageHealth = projects?.length 
    ? Math.round(projects.reduce((acc, p) => acc + p.health, 0) / projects.length)
    : 0;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't been assigned to any projects yet. Contact your account manager for more information.
          </p>
          <Button variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <span>Project Portfolio</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} • {activeProjects} active • {averageHealth}% avg health
            </p>
          </div>
          
          {detailed && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === 'all' ? 'All Status' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('on hold')}>
                    On Hold
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {detailed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{activeProjects}</p>
                  <p className="text-xs text-blue-600">Active Projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{completedProjects}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{averageHealth}%</p>
                  <p className="text-xs text-purple-600">Avg Health</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className={`grid gap-6 ${
          detailed 
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {filteredProjects.slice(0, detailed ? undefined : 4).map((project) => (
            <ProjectCard key={project._id} project={project} detailed={detailed} />
          ))}
        </div>

        {!detailed && projects.length > 4 && (
          <div className="mt-6 text-center">
            <Button variant="outline">
              View All Projects ({projects.length})
            </Button>
          </div>
        )}

        {detailed && filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No projects match your search criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
