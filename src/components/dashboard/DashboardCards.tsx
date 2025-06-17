
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeam } from "@/hooks/useTeam";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle
} from "lucide-react";
import { useMemo } from "react";

export const DashboardCards = () => {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();

  const isLoading = projectsLoading || tasksLoading || teamLoading;

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const safeProjects = projects || [];
    const safeTasks = tasks || [];
    const safeTeamMembers = teamMembers || [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Project metrics
    const activeProjects = safeProjects.filter(p => p.status === 'active').length;
    const totalProjects = safeProjects.length;
    const projectsThisWeek = safeProjects.filter(p => 
      new Date(p.createdAt) >= sevenDaysAgo
    ).length;
    const projectsLastWeek = safeProjects.filter(p => {
      const createdAt = new Date(p.createdAt);
      return createdAt >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && 
             createdAt < sevenDaysAgo;
    }).length;

    // Task metrics
    const totalTasks = safeTasks.length;
    const completedTasks = safeTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = safeTasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = safeTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    const tasksCompletedThisWeek = safeTasks.filter(t => 
      t.status === 'done' && new Date(t.updatedAt) >= sevenDaysAgo
    ).length;
    const tasksCompletedLastWeek = safeTasks.filter(t => {
      const updatedAt = new Date(t.updatedAt);
      return t.status === 'done' && 
             updatedAt >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && 
             updatedAt < sevenDaysAgo;
    }).length;

    // Team metrics
    const teamSize = safeTeamMembers.length;
    const activeMembers = safeTeamMembers.filter(m => {
      // Consider a member active if they have tasks assigned in the last 30 days
      return safeTasks.some(t => 
        t.assignedTo?._id === m._id && 
        new Date(t.updatedAt) >= thirtyDaysAgo
      );
    }).length;

    // Performance metrics
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

    // Calculate trends
    const getProjectTrend = () => {
      if (projectsThisWeek > projectsLastWeek) return { type: 'up', value: projectsThisWeek - projectsLastWeek };
      if (projectsThisWeek < projectsLastWeek) return { type: 'down', value: projectsLastWeek - projectsThisWeek };
      return { type: 'same', value: 0 };
    };

    const getTaskTrend = () => {
      if (tasksCompletedThisWeek > tasksCompletedLastWeek) return { type: 'up', value: tasksCompletedThisWeek - tasksCompletedLastWeek };
      if (tasksCompletedThisWeek < tasksCompletedLastWeek) return { type: 'down', value: tasksCompletedLastWeek - tasksCompletedThisWeek };
      return { type: 'same', value: 0 };
    };

    return {
      activeProjects,
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      teamSize,
      activeMembers,
      completionRate,
      overdueRate,
      projectTrend: getProjectTrend(),
      taskTrend: getTaskTrend(),
      tasksCompletedThisWeek
    };
  }, [projects, tasks, teamMembers]);

  const stats = [
    {
      title: "Active Projects",
      value: metrics.activeProjects,
      subtitle: `${metrics.totalProjects} total`,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      trend: metrics.projectTrend,
      description: "Projects currently in progress"
    },
    {
      title: "Task Completion",
      value: `${metrics.completionRate}%`,
      subtitle: `${metrics.completedTasks}/${metrics.totalTasks} tasks`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      trend: metrics.taskTrend,
      description: "Overall completion rate"
    },
    {
      title: "Active Team",
      value: metrics.activeMembers,
      subtitle: `${metrics.teamSize} total members`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      trend: { type: 'same', value: 0 },
      description: "Members with recent activity"
    },
    {
      title: "Overdue Tasks",
      value: metrics.overdueTasks,
      subtitle: `${metrics.overdueRate}% of total`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      iconBg: "bg-amber-500",
      trend: { type: 'same', value: 0 },
      description: "Tasks past due date"
    }
  ];

  const getTrendIcon = (trend: { type: string; value: number }) => {
    switch (trend.type) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: { type: string; value: number }) => {
    switch (trend.type) {
      case 'up':
        return "text-emerald-600";
      case 'down':
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className={`p-6 ${stat.bgColor} relative overflow-hidden`}>
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
                      {stat.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(stat.trend)}
                      {stat.trend.value > 0 && (
                        <span className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
                          +{stat.trend.value} this week
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.subtitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
