import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Award,
  Activity,
  Users,
  CheckCircle
} from "lucide-react";
import { useMemo } from "react";

export const AnalyticsWidget = () => {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();
  const { profile } = useAuth();

  const isLoading = projectsLoading || tasksLoading || teamLoading;

  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Project Analytics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const projectsThisMonth = projects.filter(p => 
      new Date(p.createdAt) >= thirtyDaysAgo
    ).length;

    // Task Analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    
    const tasksThisWeek = tasks.filter(t => 
      new Date(t.createdAt) >= sevenDaysAgo
    ).length;
    
    const tasksCompletedThisWeek = tasks.filter(t => 
      t.status === 'done' && new Date(t.updatedAt) >= sevenDaysAgo
    ).length;

    // Team Analytics
    const activeTeamMembers = teamMembers.filter(member => {
      return tasks.some(task => 
        task.assignedTo?._id === member._id && 
        new Date(task.updatedAt) >= thirtyDaysAgo
      );
    }).length;

    // Personal Analytics (if user profile exists)
    const myTasks = profile ? tasks.filter(t => t.assignedTo?._id === profile.id) : [];
    const myCompletedTasks = myTasks.filter(t => t.status === 'done').length;
    const myActiveTasks = myTasks.filter(t => t.status !== 'done').length;
    const myTasksThisWeek = myTasks.filter(t => 
      new Date(t.createdAt) >= sevenDaysAgo
    ).length;

    // Calculate rates and percentages
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectSuccessRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const teamUtilization = teamMembers.length > 0 ? Math.round((activeTeamMembers / teamMembers.length) * 100) : 0;
    const personalCompletionRate = myTasks.length > 0 ? Math.round((myCompletedTasks / myTasks.length) * 100) : 0;

    // Weekly velocity (tasks completed per week)
    const weeklyVelocity = tasksCompletedThisWeek;

    // Priority distribution
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        thisMonth: projectsThisMonth,
        successRate: projectSuccessRate
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
        thisWeek: tasksThisWeek,
        completedThisWeek: tasksCompletedThisWeek,
        completionRate,
        weeklyVelocity,
        priority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        }
      },
      team: {
        total: teamMembers.length,
        active: activeTeamMembers,
        utilization: teamUtilization
      },
      personal: {
        tasks: myTasks.length,
        completed: myCompletedTasks,
        active: myActiveTasks,
        thisWeek: myTasksThisWeek,
        completionRate: personalCompletionRate
      }
    };
  }, [projects, tasks, teamMembers, profile]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (value: number, threshold: number, type: 'high' | 'low' = 'high') => {
    const isGood = type === 'high' ? value >= threshold : value <= threshold;
    return (
      <Badge 
        variant={isGood ? "default" : "destructive"} 
        className={`text-xs ${isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
      >
        {isGood ? 'Good' : 'Needs Attention'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Performance Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Task Completion Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Task Completion</span>
                </div>
                {getStatusBadge(analytics.tasks.completionRate, 70)}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.completionRate}%</div>
                <Progress 
                  value={analytics.tasks.completionRate} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {analytics.tasks.completed} of {analytics.tasks.total} tasks
                </p>
              </div>
            </div>

            {/* Weekly Velocity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Weekly Velocity</span>
                </div>
                {getStatusBadge(analytics.tasks.weeklyVelocity, 5)}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.weeklyVelocity}</div>
                <div className="text-xs text-gray-500">tasks completed this week</div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">+{analytics.tasks.thisWeek} new tasks</span>
                </div>
              </div>
            </div>

            {/* Team Utilization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Team Utilization</span>
                </div>
                {getStatusBadge(analytics.team.utilization, 60)}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{analytics.team.utilization}%</div>
                <Progress 
                  value={analytics.team.utilization} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {analytics.team.active} of {analytics.team.total} members active
                </p>
              </div>
            </div>

            {/* Project Success Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Project Success</span>
                </div>
                {getStatusBadge(analytics.projects.successRate, 50)}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{analytics.projects.successRate}%</div>
                <Progress 
                  value={analytics.projects.successRate} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {analytics.projects.completed} of {analytics.projects.total} completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Task Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{analytics.tasks.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{analytics.tasks.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">To Do</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{analytics.tasks.todo}</span>
              </div>
              {analytics.tasks.overdue > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{analytics.tasks.overdue}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Performance */}
        {profile && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Your Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {analytics.personal.completionRate}%
                  </div>
                  <p className="text-sm text-gray-600">Personal Completion Rate</p>
                  <Progress 
                    value={analytics.personal.completionRate} 
                    className="mt-2 h-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{analytics.personal.completed}</div>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{analytics.personal.active}</div>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{analytics.personal.thisWeek} tasks assigned this week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
