import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';
import { useTeam } from './useTeam';

export interface RealTimeNotification {
  id: string;
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'project_milestone' | 'meeting_reminder' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionable: boolean;
  action?: string;
  link?: string;
  project?: string;
  task?: string;
  user?: string;
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useAuth();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { data: teamMembers = [] } = useTeam();

  useEffect(() => {
    if (!profile) return;

    const generateNotifications = (): RealTimeNotification[] => {
      const now = new Date();
      const generatedNotifications: RealTimeNotification[] = [];

      // Task due soon notifications
      const tasksDueSoon = tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 2 && daysDiff >= 0 && task.assignedTo?._id === profile.id;
      });

      tasksDueSoon.forEach(task => {
        const dueDate = new Date(task.dueDate!);
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const project = projects.find(p => p._id === task.project?._id || p._id === task.project);
        
        generatedNotifications.push({
          id: `task-due-${task._id}`,
          type: 'task_due',
          title: daysDiff === 0 ? 'Task Due Today' : `Task Due in ${daysDiff} Day${daysDiff !== 1 ? 's' : ''}`,
          message: `"${task.title}" is due ${daysDiff === 0 ? 'today' : `in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`}`,
          priority: daysDiff === 0 ? 'urgent' : task.priority === 'urgent' ? 'high' : 'medium',
          timestamp: now.toISOString(),
          read: false,
          actionable: true,
          action: 'View Task',
          link: `/tasks?id=${task._id}`,
          project: project?.title,
          task: task._id
        });
      });

      // Overdue task notifications
      const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.assignedTo?._id === profile.id;
      });

      overdueTasks.forEach(task => {
        const dueDate = new Date(task.dueDate!);
        const days = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
        const project = projects.find(p => p._id === task.project?._id || p._id === task.project);
        
        generatedNotifications.push({
          id: `task-overdue-${task._id}`,
          type: 'task_due',
          title: 'Task Overdue',
          message: `"${task.title}" was due ${days} day${days !== 1 ? 's' : ''} ago`,
          priority: 'urgent',
          timestamp: now.toISOString(),
          read: false,
          actionable: true,
          action: 'Complete Now',
          link: `/tasks?id=${task._id}`,
          project: project?.title,
          task: task._id
        });
      });

      // New task assignments (simulated based on recent tasks)
      const recentTasks = tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600);
        return hoursDiff <= 24 && task.assignedTo?._id === profile.id;
      });

      recentTasks.forEach(task => {
        const project = projects.find(p => p._id === task.project?._id || p._id === task.project);
        const assignedBy = teamMembers.find(member => member.id === task.createdBy?._id);
        
        generatedNotifications.push({
          id: `task-assigned-${task._id}`,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You've been assigned "${task.title}"`,
          priority: task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'medium',
          timestamp: task.createdAt,
          read: false,
          actionable: true,
          action: 'View Details',
          link: `/tasks?id=${task._id}`,
          project: project?.title,
          task: task._id,
          user: assignedBy?.fullName || 'Unknown'
        });
      });

      // Project milestones (based on project progress)
      const activeProjects = projects.filter(p => p.status === 'active');
      
      activeProjects.forEach(project => {
        const projectTasks = tasks.filter(t => t.project?._id === project._id || t.project === project._id);
        const completedTasks = projectTasks.filter(t => t.status === 'done');
        const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
        
        // Milestone notifications for significant progress
        if (progress === 50 || progress === 75 || progress === 100) {
          const milestoneType = progress === 100 ? 'Project Complete!' : `${progress}% Complete`;
          
          generatedNotifications.push({
            id: `milestone-${project._id}-${progress}`,
            type: 'project_milestone',
            title: 'Project Milestone',
            message: `${project.title} is ${milestoneType}`,
            priority: progress === 100 ? 'high' : 'medium',
            timestamp: now.toISOString(),
            read: false,
            actionable: true,
            action: 'View Project',
            link: `/projects?id=${project._id}`,
            project: project.title
          });
        }
      });

      // Team activity notifications (simulated based on recent task completions)
      const recentCompletions = tasks.filter(task => {
        if (task.status !== 'done') return false;
        const updatedDate = new Date(task.updatedAt);
        const hoursDiff = (now.getTime() - updatedDate.getTime()) / (1000 * 3600);
        return hoursDiff <= 12 && task.assignedTo?._id !== profile.id; // Others' completions
      });

      recentCompletions.slice(0, 3).forEach(task => {
        const project = projects.find(p => p._id === task.project?._id || p._id === task.project);
        const completedBy = teamMembers.find(member => member.id === task.assignedTo?._id);
        
        generatedNotifications.push({
          id: `task-completed-${task._id}`,
          type: 'task_completed',
          title: 'Task Completed',
          message: `${completedBy?.fullName || 'Team member'} completed "${task.title}"`,
          priority: 'low',
          timestamp: task.updatedAt,
          read: false,
          actionable: false,
          project: project?.title,
          task: task._id,
          user: completedBy?.fullName || 'Unknown'
        });
      });

      return generatedNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };

    const newNotifications = generateNotifications();
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      const updatedNotifications = generateNotifications();
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    }, 30000);

    return () => clearInterval(interval);
  }, [profile, projects, tasks, teamMembers]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification: clearNotification, // Alias for backward compatibility
    clearNotification,
    clearAllNotifications,
    isLoading: !profile || notifications.length === 0
  };
};
