import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  feedbackSubmitted: number;
  activeFeedbackCount: number;
  meetingsAttended: number;
  overallHealth: number;
  onTrackProjects: number;
  completedMilestones: number;
  avgResponseTime: string;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    status?: string;
  }>;
}

export interface ClientProject {
  _id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  health: number;
  manager: {
    id: string;
    fullName: string;
    email: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: string;
    progress: number;
  }>;
  members: Array<{
    id: string;
    fullName: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFeedback {
  _id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  project: {
    _id: string;
    title: string;
  };
  response?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const useClientDashboardStats = () => {
  const { profile } = useAuth();
  
  return useQuery<ClientDashboardStats>({
    queryKey: ['client-dashboard-stats'],
    queryFn: async () => {
      return await apiClient.getClientDashboardStats();
    },
    enabled: !!profile && profile.role === 'client',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientProjects = () => {
  const { profile } = useAuth();
  
  return useQuery<ClientProject[]>({
    queryKey: ['client-projects'],
    queryFn: async () => {
      return await apiClient.getClientProjects();
    },
    enabled: !!profile && profile.role === 'client',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientFeedback = () => {
  const { profile } = useAuth();
  
  return useQuery<ClientFeedback[]>({
    queryKey: ['client-feedback'],
    queryFn: async () => {
      return await apiClient.getClientFeedback();
    },
    enabled: !!profile && profile.role === 'client',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientRecentActivity = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['client-recent-activity'],
    queryFn: async () => {
      return await apiClient.getClientRecentActivity();
    },
    enabled: !!profile && profile.role === 'client',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
