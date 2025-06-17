import { useMemo } from 'react';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';
import { useTeam } from './useTeam';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    teamMembers: number;
    averageProjectCompletion: number;
  };
  performance: {
    weeklyTaskCompletion: number;
    monthlyTaskCompletion: number;
    productivityScore: number;
    velocityTrend: 'up' | 'down' | 'stable';
    efficiencyRating: number;
  };
  team: {
    mostActiveMembers: Array<{
      id: string;
      name: string;
      tasksCompleted: number;
      avatar?: string;
    }>;
    teamUtilization: number;
    averageTasksPerMember: number;
    collaboration: {
      sharedProjects: number;
      crossTeamTasks: number;
    };
  };
  projects: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    averageDuration: number;
    successRate: number;
    upcomingDeadlines: Array<{
      projectId: string;
      title: string;
      dueDate: string;
      daysLeft: number;
      progress: number;
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
    myProjects: {
      leading: number;
      participating: number;
      completed: number;
    };
    productivity: {
      tasksCompletedThisWeek: number;
      tasksCompletedLastWeek: number;
      improvementTrend: 'up' | 'down' | 'stable';
      focusTime: number; // hours spent on high-priority tasks
    };
    achievements: Array<{
      type: 'streak' | 'milestone' | 'collaboration' | 'efficiency';
      title: string;
      description: string;
      date: string;
      icon: string;
    }>;
  };
  insights: Array<{
    type: 'warning' | 'success' | 'info' | 'trend';
    title: string;
    message: string;
    actionable: boolean;
    action?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export const useDashboardAnalytics = () => {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();
  const { profile } = useAuth();

  const analytics = useMemo((): DashboardAnalytics => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Overview calculations
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return new Date(t.dueDate) < now;
    }).length;

    // Calculate average project completion
    const projectCompletions = projects.map(project => {
      const projectTasks = tasks.filter(t => 
        (t.project?._id === project._id) || (t.project === project._id)
      );
      const completed = projectTasks.filter(t => t.status === 'done').length;
      return projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
    });
    const averageProjectCompletion = projectCompletions.length > 0 
      ? Math.round(projectCompletions.reduce((sum, comp) => sum + comp, 0) / projectCompletions.length)
      : 0;

    // Performance calculations
    const tasksCompletedThisWeek = tasks.filter(t => 
      t.status === 'done' && new Date(t.updatedAt) >= oneWeekAgo
    ).length;
    const tasksCompletedLastWeek = tasks.filter(t => {
      const updatedDate = new Date(t.updatedAt);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return t.status === 'done' && updatedDate >= twoWeeksAgo && updatedDate < oneWeekAgo;
    }).length;
    const tasksCompletedThisMonth = tasks.filter(t => 
      t.status === 'done' && new Date(t.updatedAt) >= oneMonthAgo
    ).length;

    const velocityTrend = tasksCompletedThisWeek > tasksCompletedLastWeek ? 'up' : 
                        tasksCompletedThisWeek < tasksCompletedLastWeek ? 'down' : 'stable';

    // Team analytics
    const memberTaskCounts = teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo?._id === member._id);
      const completedCount = memberTasks.filter(t => t.status === 'done').length;
      return {
        id: member._id,
        name: member.fullName,
        tasksCompleted: completedCount,
        avatar: member.avatar
      };
    }).sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    const teamUtilization = teamMembers.length > 0 
      ? Math.round((tasks.filter(t => t.status !== 'done').length / teamMembers.length) * 100)
      : 0;

    // Project analytics
    const projectsByStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const upcomingDeadlines = projects
      .filter(p => p.endDate && p.status === 'active')
      .map(project => {
        const dueDate = new Date(project.endDate!);
        const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const projectTasks = tasks.filter(t => 
          (t.project?._id === project._id) || (t.project === project._id)
        );
        const completedTasks = projectTasks.filter(t => t.status === 'done').length;
        const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
        
        return {
          projectId: project._id,
          title: project.title,
          dueDate: project.endDate!,
          daysLeft,
          progress
        };
      })
      .filter(p => p.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // Task analytics
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
      
      const completed = tasks.filter(t => {
        if (t.status !== 'done') return false;
        const completedDate = new Date(t.updatedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      }).length;

      const created = tasks.filter(t => {
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0];
        return createdDate === dateStr;
      }).length;

      return { date: dateStr, completed, created };
    }).reverse();

    // Personal analytics (if user profile exists)
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
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return t.status === 'done' && updatedDate >= twoWeeksAgo && updatedDate < oneWeekAgo;
    }).length;

    const improvementTrend = myTasksCompletedThisWeek > myTasksCompletedLastWeek ? 'up' : 
                           myTasksCompletedThisWeek < myTasksCompletedLastWeek ? 'down' : 'stable';

    // Generate insights
    const insights = [];

    if (overdueTasks > 0) {
      insights.push({
        type: 'warning' as const,
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks} overdue task${overdueTasks !== 1 ? 's' : ''} that need attention`,
        actionable: true,
        action: 'View Overdue Tasks',
        priority: 'high' as const
      });
    }

    if (velocityTrend === 'up') {
      insights.push({
        type: 'success' as const,
        title: 'Productivity Boost',
        message: `Task completion increased by ${tasksCompletedThisWeek - tasksCompletedLastWeek} tasks this week`,
        actionable: false,
        priority: 'medium' as const
      });
    }

    if (upcomingDeadlines.length > 0) {
      const urgentDeadlines = upcomingDeadlines.filter(d => d.daysLeft <= 7);
      if (urgentDeadlines.length > 0) {
        insights.push({
          type: 'warning' as const,
          title: 'Upcoming Deadlines',
          message: `${urgentDeadlines.length} project${urgentDeadlines.length !== 1 ? 's' : ''} due within a week`,
          actionable: true,
          action: 'Review Projects',
          priority: 'high' as const
        });
      }
    }

    const productivityScore = Math.min(100, Math.round(
      (tasksCompletedThisWeek * 20) + 
      (averageProjectCompletion * 0.5) + 
      ((teamMembers.length > 0 ? (100 - teamUtilization) : 50) * 0.3)
    ));

    return {
      overview: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalTasks: tasks.length,
        completedTasks,
        overdueTasks,
        teamMembers: teamMembers.length,
        averageProjectCompletion
      },
      performance: {
        weeklyTaskCompletion: tasksCompletedThisWeek,
        monthlyTaskCompletion: tasksCompletedThisMonth,
        productivityScore,
        velocityTrend,
        efficiencyRating: Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)
      },
      team: {
        mostActiveMembers: memberTaskCounts.slice(0, 5),
        teamUtilization: Math.min(100, teamUtilization),
        averageTasksPerMember: teamMembers.length > 0 ? Math.round(tasks.length / teamMembers.length) : 0,
        collaboration: {
          sharedProjects: projects.filter(p => p.members && p.members.length > 1).length,
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
        myProjects: {
          leading: myProjects.filter(p => p.createdBy?._id === profile?.id).length,
          participating: myProjects.filter(p => 
            p.createdBy?._id !== profile?.id && 
            p.members?.some(m => m.user?._id === profile?.id)
          ).length,
          completed: myProjects.filter(p => p.status === 'completed').length
        },
        productivity: {
          tasksCompletedThisWeek: myTasksCompletedThisWeek,
          tasksCompletedLastWeek: myTasksCompletedLastWeek,
          improvementTrend,
          focusTime: myTasksCompletedThisWeek * 2 // placeholder calculation
        },
        achievements: []
      },
      insights
    };
  }, [projects, tasks, teamMembers, profile]);

  return {
    analytics,
    isLoading: projectsLoading || tasksLoading || teamLoading,
    error: null
  };
};
