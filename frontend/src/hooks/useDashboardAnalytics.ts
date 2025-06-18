import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';
import { useTeam } from './useTeam';

interface DashboardAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    teamMembers: number;
    completionRate: number;
    teamProductivity: {
      thisWeek: number;
      lastWeek: number;
      trend: 'up' | 'down' | 'stable';
      crossTeamTasks: number;
    };
  };
  projects: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    averageDuration: number;
    successRate: number;
    upcomingDeadlines: Array<{
      id: string;
      title: string;
      dueDate: string;
      daysUntilDue: number;
    }>;
  };
  tasks: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    completionTrends: Array<{
      date: string;
      completed: number;
      created: number;
    }>;
    averageCompletionTime: number;
    bottlenecks: Array<{
      status: string;
      count: number;
      averageDaysStuck: number;
    }>;
  };
  personal: {
    myTasks: {
      total: number;
      completed: number;
      pending: number;
      overdue: number;
    };
    myProjects: number;
    productivity: {
      thisWeek: number;
      lastWeek: number;
      trend: 'up' | 'down' | 'stable';
    };
    upcomingDeadlines: Array<{
      id: string;
      title: string;
      dueDate: string;
      project: string;
    }>;
  };
  team: {
    mostActive: Array<{
      id: string;
      name: string;
      tasksCompleted: number;
      completionRate: number;
    }>;
    workloadDistribution: Array<{
      memberId: string;
      name: string;
      activeTasks: number;
      completedTasks: number;
      workload: 'light' | 'normal' | 'heavy';
    }>;
    collaboration: {
      crossFunctionalTasks: number;
      sharedProjects: number;
      teamEfficiency: number;
    };
  };
}

export const useDashboardAnalytics = (): {
  analytics: DashboardAnalytics | undefined;
  isLoading: boolean;
  error: any;
} => {
  const { profile } = useAuth();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();

  const isLoading = projectsLoading || tasksLoading || teamLoading;

  const query = useQuery({
    queryKey: ['dashboard-analytics', projects, tasks, teamMembers, profile?.id],
    queryFn: () => {
      if (!profile || isLoading) return null;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Project analytics
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      const projectsByStatus = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const upcomingDeadlines = projects
        .filter(p => p.endDate && new Date(p.endDate) > now)
        .map(p => ({
          id: p._id,
          title: p.title,
          dueDate: p.endDate!,
          daysUntilDue: Math.ceil((new Date(p.endDate!).getTime() - now.getTime()) / (1000 * 3600 * 24))
        }))
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
        .slice(0, 5);

      // Task analytics
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      
      const tasksByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tasksByPriority = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Completion trends (last 7 days)
      const completionTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const completedOnDate = tasks.filter(t => {
          if (t.status !== 'done') return false;
          const updatedDate = new Date(t.updatedAt);
          return updatedDate.toISOString().split('T')[0] === dateStr;
        }).length;

        const createdOnDate = tasks.filter(t => {
          const createdDate = new Date(t.createdAt);
          return createdDate.toISOString().split('T')[0] === dateStr;
        }).length;

        return {
          date: dateStr,
          completed: completedOnDate,
          created: createdOnDate
        };
      }).reverse();

      // Personal analytics
      const myTasks = profile ? tasks.filter(t => t.assignedTo?._id === profile.id) : [];
      const myProjects = profile ? projects.filter(p => 
        p.createdBy?._id === profile.id || 
        p.members?.some(m => m.user?._id === profile.id)
      ) : [];

      const myTasksCompleted = myTasks.filter(t => t.status === 'done').length;
      const myTasksPending = myTasks.filter(t => t.status !== 'done').length;
      const myTasksOverdue = myTasks.filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        return new Date(t.dueDate) < now;
      }).length;

      const myTasksCompletedThisWeek = myTasks.filter(t => 
        t.status === 'done' && new Date(t.updatedAt) >= oneWeekAgo
      ).length;
      const myTasksCompletedLastWeek = myTasks.filter(t => {
        const updatedDate = new Date(t.updatedAt);
        return t.status === 'done' && updatedDate >= twoWeeksAgo && updatedDate < oneWeekAgo;
      }).length;

      const myProductivityTrend: 'up' | 'down' | 'stable' = myTasksCompletedThisWeek > myTasksCompletedLastWeek ? 'up' : 
        myTasksCompletedThisWeek < myTasksCompletedLastWeek ? 'down' : 'stable';

      const myUpcomingDeadlines = myTasks
        .filter(t => t.dueDate && new Date(t.dueDate) > now && t.status !== 'done')
        .map(t => ({
          id: t._id,
          title: t.title,
          dueDate: t.dueDate!,
          project: projects.find(p => p._id === t.project?._id || p._id === t.project)?.title || 'Unknown'
        }))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

      // Team analytics
      const teamTasksThisWeek = tasks.filter(t => 
        t.status === 'done' && new Date(t.updatedAt) >= oneWeekAgo
      ).length;
      const teamTasksLastWeek = tasks.filter(t => {
        const updatedDate = new Date(t.updatedAt);
        return t.status === 'done' && updatedDate >= twoWeeksAgo && updatedDate < oneWeekAgo;
      }).length;

      const teamProductivityTrend: 'up' | 'down' | 'stable' = teamTasksThisWeek > teamTasksLastWeek ? 'up' : 
        teamTasksThisWeek < teamTasksLastWeek ? 'down' : 'stable';

      const mostActive = teamMembers
        .map(member => {
          const memberTasks = tasks.filter(t => t.assignedTo?._id === member.id);
          const memberCompletedTasks = memberTasks.filter(t => t.status === 'done').length;
          return {
            id: member.id,
            name: member.fullName,
            tasksCompleted: memberCompletedTasks,
            completionRate: memberTasks.length > 0 ? Math.round((memberCompletedTasks / memberTasks.length) * 100) : 0
          };
        })
        .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
        .slice(0, 5);

      const workloadDistribution = teamMembers.map(member => {
        const memberTasks = tasks.filter(t => t.assignedTo?._id === member.id);
        const activeTasks = memberTasks.filter(t => t.status !== 'done').length;
        const completedTasks = memberTasks.filter(t => t.status === 'done').length;
        
        let workload: 'light' | 'normal' | 'heavy' = 'light';
        if (activeTasks > 10) workload = 'heavy';
        else if (activeTasks > 5) workload = 'normal';

        return {
          memberId: member.id,
          name: member.fullName,
          activeTasks,
          completedTasks,
          workload
        };
      });

      return {
        overview: {
          totalProjects: projects.length,
          activeProjects,
          totalTasks: tasks.length,
          completedTasks,
          teamMembers: teamMembers.length,
          completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
          teamProductivity: {
            thisWeek: teamTasksThisWeek,
            lastWeek: teamTasksLastWeek,
            trend: teamProductivityTrend,
            crossTeamTasks: tasks.filter(t => t.assignedTo && t.createdBy && t.assignedTo._id !== t.createdBy._id).length
          }
        },
        projects: {
          byStatus: projectsByStatus,
          byPriority: {},
          averageDuration: 30, // placeholder
          successRate: Math.round((completedProjects / Math.max(projects.length, 1)) * 100),
          upcomingDeadlines
        },
        tasks: {
          byStatus: tasksByStatus,
          byPriority: tasksByPriority,
          completionTrends,
          averageCompletionTime: 3, // placeholder days
          bottlenecks: [
            { status: 'in_progress', count: tasksByStatus.in_progress || 0, averageDaysStuck: 5 },
            { status: 'review', count: tasksByStatus.review || 0, averageDaysStuck: 2 }
          ]
        },
        personal: {
          myTasks: {
            total: myTasks.length,
            completed: myTasksCompleted,
            pending: myTasksPending,
            overdue: myTasksOverdue
          },
          myProjects: myProjects.length,
          productivity: {
            thisWeek: myTasksCompletedThisWeek,
            lastWeek: myTasksCompletedLastWeek,
            trend: myProductivityTrend
          },
          upcomingDeadlines: myUpcomingDeadlines
        },
        team: {
          mostActive,
          workloadDistribution,
          collaboration: {
            crossFunctionalTasks: tasks.filter(t => t.assignedTo && t.createdBy && t.assignedTo._id !== t.createdBy._id).length,
            sharedProjects: projects.filter(p => p.members && p.members.length > 1).length,
            teamEfficiency: Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)
          }
        }
      };
    },
    enabled: !isLoading && !!profile,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
