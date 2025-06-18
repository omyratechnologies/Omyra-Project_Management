import axios, { AxiosResponse } from 'axios';
import { TeamMember } from '@/types/team';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  profile: {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'project_manager' | 'team_member' | 'client' | 'accountant';
    avatar?: string;
  };
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'client' | 'accountant';
  avatar?: string;
  phone?: string;
  location?: string;
  preferences?: {
    notifications?: {
      emailNotifications?: boolean;
      taskAssignments?: boolean;
      projectUpdates?: boolean;
      dueDateReminders?: boolean;
      teamActivity?: boolean;
    };
    appearance?: {
      theme?: string;
      language?: string;
      timezone?: string;
    };
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  client?: Client;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  _id: string;
  project: string;
  user: any;
  roleInProject: string;
  joinedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project: any;
  assignedTo?: any;
  createdBy: any;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskIssue {
  _id: string;
  task: string | Task;
  reportedBy: any;
  title: string;
  description: string;
  type: 'bug' | 'blocker' | 'clarification' | 'resource_needed' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: any;
  resolution?: string;
  resolvedBy?: any;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFeedback {
  _id: string;
  project: string | Project;
  client: any;
  type: 'general' | 'feature_request' | 'bug_report' | 'improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: any;
  response?: string;
  respondedBy?: any;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  user: any;
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
  };
  billingInfo?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    taxId?: string;
    paymentTerms?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  notes?: string;
  projects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
  };
  billingInfo?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    taxId?: string;
    paymentTerms?: string;
  };
  notes?: string;
}

export interface UpdateClientRequest {
  companyName?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  billingInfo?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    taxId?: string;
    paymentTerms?: string;
  };
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  notes?: string;
}

export interface MeetingAttendee {
  _id: string;
  meeting: string;
  user: any;
  status: 'attending' | 'not_attending' | 'tentative';
  reason?: string;
  joinedAt?: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfluencePage {
  _id: string;
  title: string;
  content: string;
  type: 'feature' | 'documentation' | 'process' | 'meeting_notes';
  project?: string | Project;
  createdBy: any;
  lastModifiedBy: any;
  assignedTo?: any;
  tags: string[];
  isPublic: boolean;
  viewPermissions: string[];
  editPermissions: string[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  parentPage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  project: any;
  scheduledAt: string;
  duration: number;
  organizer: any;
  attendees: any[];
  locationUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform team member data
const transformTeamMember = (data: any): TeamMember => ({
  id: data._id || data.id,
  userId: data.userId || data._id || data.id, // Include userId for backend operations
  email: data.email || '',
  fullName: data.fullName || '',
  role: data.role || 'team_member',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// API Client Class
class ApiClient {
  // Auth methods
  async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', {
      email,
      password,
      fullName,
    });
    return response.data.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/profile');
    return response.data.data!;
  }

  // Settings methods
  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    location?: string;
    avatar?: string;
  }): Promise<Profile> {
    const response: AxiosResponse<ApiResponse<Profile>> = await api.put('/auth/profile', data);
    return response.data.data!;
  }

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.put('/auth/password', data);
  }

  async updatePreferences(data: {
    notifications?: {
      emailNotifications?: boolean;
      taskAssignments?: boolean;
      projectUpdates?: boolean;
      dueDateReminders?: boolean;
      teamActivity?: boolean;
    };
    appearance?: {
      theme?: string;
      language?: string;
      timezone?: string;
    };
  }): Promise<void> {
    await api.put('/auth/preferences', data);
  }

  async getPreferences(): Promise<{
    notifications: {
      emailNotifications: boolean;
      taskAssignments: boolean;
      projectUpdates: boolean;
      dueDateReminders: boolean;
      teamActivity: boolean;
    };
    appearance: {
      theme: string;
      language: string;
      timezone: string;
    };
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/auth/preferences');
    return response.data.data!;
  }

  async updateCompanySettings(data: {
    companyName?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyAddress?: string;
  }): Promise<void> {
    await api.put('/company/settings', data);
  }

  async getCompanySettings(): Promise<{
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    companyAddress: string;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/company/settings');
    return response.data.data!;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const response: AxiosResponse<ApiResponse<Project[]>> = await api.get('/projects');
    return response.data.data!;
  }

  async getProject(id: string): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.get(`/projects/${id}`);
    return response.data.data!;
  }

  async createProject(data: {
    title: string;
    description?: string;
    status?: Project['status'];
    startDate?: string;
    endDate?: string;
  }): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.post('/projects', data);
    return response.data.data!;
  }

  async updateProject(id: string, data: {
    title?: string;
    description?: string;
    status?: Project['status'];
    startDate?: string;
    endDate?: string;
  }): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${id}`, data);
    return response.data.data!;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  async addProjectMember(projectId: string, data: {
    userId: string;
    roleInProject?: string;
  }): Promise<ProjectMember> {
    const response: AxiosResponse<ApiResponse<ProjectMember>> = await api.post(
      `/projects/${projectId}/members`,
      data
    );
    return response.data.data!;
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  }

  async assignClientToProject(projectId: string, clientId: string): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${projectId}/client`, {
      clientId
    });
    return response.data.data!;
  }

  async removeClientFromProject(projectId: string): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.delete(`/projects/${projectId}/client`);
    return response.data.data!;
  }

  // Task methods
  async getTasks(projectId?: string): Promise<Task[]> {
    const params = projectId ? { projectId } : {};
    const response: AxiosResponse<ApiResponse<Task[]>> = await api.get('/tasks', { params });
    return response.data.data!;
  }

  async getTask(id: string): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await api.get(`/tasks/${id}`);
    return response.data.data!;
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority?: Task['priority'];
    assignedTo?: string;
    dueDate?: string;
    projectId: string;
  }): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await api.post('/tasks', data);
    return response.data.data!;
  }

  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    status?: Task['status'];
    priority?: Task['priority'];
    assignedTo?: string;
    dueDate?: string;
  }): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await api.put(`/tasks/${id}`, data);
    return response.data.data!;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  // Team methods
  async getTeamMembers(projectId?: string): Promise<TeamMember[]> {
    const response = await api.get<ApiResponse<any[]>>(
      `/team${projectId ? `?projectId=${projectId}` : ''}`
    );
    return response.data.data?.map(transformTeamMember) || [];
  }

  async getTeamMember(id: string): Promise<TeamMember> {
    const response = await api.get<ApiResponse<any>>(`/team/${id}`);
    return transformTeamMember(response.data.data!);
  }

  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const response = await api.patch<ApiResponse<any>>(`/team/${id}`, data);
    return transformTeamMember(response.data.data!);
  }

  async deleteTeamMember(id: string): Promise<void> {
    await api.delete(`/team/${id}`);
  }

  // async sendTeamInvitation(data: {
  //   email: string;
  //   fullName: string;
  //   role: string;
  //   organizationName: string;
  //   projectId?: string;
  // }): Promise<TeamMember> {
  //   const response = await api.post<ApiResponse<any>>('/invitations', data);
  //   return transformTeamMember(response.data.data!);
  // }

  // Team invitation methods
  async sendTeamInvitation(data: {
    email: string;
    fullName: string;
    role: 'admin' | 'project_manager' | 'team_member';
    organizationName?: string;
    projectId?: string;
  }): Promise<{ invitationId: string; email: string; role: string; expiresAt: string }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/invitations/send', data);
    return response.data.data!;
  }

  async acceptInvitation(data: {
    token: string;
    password: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/invitations/accept', data);
    return response.data.data!;
  }

  async getInvitationDetails(token: string): Promise<{
    email: string;
    inviteeName: string;
    inviterName: string;
    organizationName?: string;
    role: string;
    expiresAt: string;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/invitations/details/${token}`);
    return response.data.data!;
  }

  // Email methods
  async sendTeamInvitationEmail(data: {
    email: string;
    inviteeName: string;
    inviterName: string;
    organizationName?: string;
    role: 'admin' | 'project_manager' | 'team_member';
    invitationToken: string;
  }): Promise<void> {
    await api.post('/email/send-team-invitation', data);
  }

  // Meetings methods
  async getMeetings(params?: {
    projectId?: string;
    status?: string;
    upcoming?: boolean;
  }): Promise<Meeting[]> {
    const response: AxiosResponse<ApiResponse<Meeting[]>> = await api.get('/meetings', { params });
    return response.data.data!;
  }

  async getMeeting(id: string): Promise<Meeting> {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.get(`/meetings/${id}`);
    return response.data.data!;
  }

  async createMeeting(data: {
    title: string;
    description?: string;
    projectId: string;
    scheduledAt: string;
    duration: number;
    attendees: string[];
    locationUrl?: string;
  }): Promise<Meeting> {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post('/meetings', data);
    return response.data.data!;
  }

  async updateMeeting(id: string, data: {
    title?: string;
    description?: string;
    scheduledAt?: string;
    duration?: number;
    attendees?: string[];
    locationUrl?: string;
    status?: Meeting['status'];
  }): Promise<Meeting> {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.put(`/meetings/${id}`, data);
    return response.data.data!;
  }

  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`);
  }

  async getUpcomingMeetings(limit?: number): Promise<Meeting[]> {
    const params = limit ? { limit } : {};
    const response: AxiosResponse<ApiResponse<Meeting[]>> = await api.get('/meetings/upcoming', { params });
    return response.data.data!;
  }

  // Task Issues
  async createTaskIssue(taskId: string, data: {
    title: string;
    description: string;
    type: TaskIssue['type'];
    priority: TaskIssue['priority'];
  }): Promise<TaskIssue> {
    const response: AxiosResponse<ApiResponse<TaskIssue>> = await api.post(`/tasks/${taskId}/issues`, data);
    return response.data.data!;
  }

  async getTaskIssues(taskId: string, filters?: {
    status?: string;
    priority?: string;
    type?: string;
  }): Promise<TaskIssue[]> {
    const response: AxiosResponse<ApiResponse<TaskIssue[]>> = await api.get(`/tasks/${taskId}/issues`, {
      params: filters
    });
    return response.data.data!;
  }

  async updateTaskIssue(issueId: string, data: {
    title?: string;
    description?: string;
    type?: TaskIssue['type'];
    priority?: TaskIssue['priority'];
    status?: TaskIssue['status'];
    assignedTo?: string;
    resolution?: string;
  }): Promise<TaskIssue> {
    const response: AxiosResponse<ApiResponse<TaskIssue>> = await api.put(`/issues/${issueId}`, data);
    return response.data.data!;
  }

  async deleteTaskIssue(issueId: string): Promise<void> {
    await api.delete(`/issues/${issueId}`);
  }

  // Client Management
  async createClient(data: CreateClientRequest): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await api.post('/clients', data);
    return response.data.data!;
  }

  async getClients(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ clients: Client[]; pagination: any }> {
    const response: AxiosResponse<ApiResponse<{ clients: Client[]; pagination: any }>> = await api.get('/clients', { params });
    return response.data.data!;
  }

  async getClient(clientId: string): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await api.get(`/clients/${clientId}`);
    return response.data.data!;
  }

  async updateClient(clientId: string, data: UpdateClientRequest): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await api.put(`/clients/${clientId}`, data);
    return response.data.data!;
  }

  async deleteClient(clientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  }

  async suspendClient(clientId: string): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await api.patch(`/clients/${clientId}/suspend`);
    return response.data.data!;
  }

  async reactivateClient(clientId: string): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await api.patch(`/clients/${clientId}/reactivate`);
    return response.data.data!;
  }

  // Client Feedback
  async createClientFeedback(projectId: string, data: {
    type: ClientFeedback['type'];
    title: string;
    description: string;
    priority: ClientFeedback['priority'];
  }): Promise<ClientFeedback> {
    const response: AxiosResponse<ApiResponse<ClientFeedback>> = await api.post(`/projects/${projectId}/feedback`, data);
    return response.data.data!;
  }

  async getProjectFeedback(projectId: string, filters?: {
    status?: string;
    type?: string;
    priority?: string;
  }): Promise<ClientFeedback[]> {
    const response: AxiosResponse<ApiResponse<ClientFeedback[]>> = await api.get(`/projects/${projectId}/feedback`, {
      params: filters
    });
    return response.data.data!;
  }

  async updateClientFeedback(feedbackId: string, data: {
    title?: string;
    description?: string;
    priority?: ClientFeedback['priority'];
    status?: ClientFeedback['status'];
    response?: string;
  }): Promise<ClientFeedback> {
    const response: AxiosResponse<ApiResponse<ClientFeedback>> = await api.put(`/feedback/${feedbackId}`, data);
    return response.data.data!;
  }

  // Meeting Attendance
  async updateMeetingAttendance(meetingId: string, data: {
    status: MeetingAttendee['status'];
    reason?: string;
  }): Promise<MeetingAttendee> {
    const response: AxiosResponse<ApiResponse<MeetingAttendee>> = await api.put(`/meetings/${meetingId}/attendance`, data);
    return response.data.data!;
  }

  async getMeetingAttendance(meetingId: string): Promise<MeetingAttendee[]> {
    const response: AxiosResponse<ApiResponse<MeetingAttendee[]>> = await api.get(`/meetings/${meetingId}/attendance`);
    return response.data.data!;
  }

  async getMyMeetingAttendance(meetingId: string): Promise<MeetingAttendee | null> {
    const response: AxiosResponse<ApiResponse<MeetingAttendee | null>> = await api.get(`/meetings/${meetingId}/my-attendance`);
    return response.data.data;
  }

  async joinMeeting(meetingId: string): Promise<MeetingAttendee> {
    const response: AxiosResponse<ApiResponse<MeetingAttendee>> = await api.post(`/meetings/${meetingId}/join`);
    return response.data.data!;
  }

  async leaveMeeting(meetingId: string): Promise<MeetingAttendee> {
    const response: AxiosResponse<ApiResponse<MeetingAttendee>> = await api.post(`/meetings/${meetingId}/leave`);
    return response.data.data!;
  }

  // Confluence Pages
  async createConfluencePage(data: {
    title: string;
    content: string;
    type: ConfluencePage['type'];
    projectId?: string;
    assignedTo?: string;
    tags: string[];
    isPublic: boolean;
    viewPermissions: string[];
    editPermissions: string[];
    parentPageId?: string;
  }): Promise<ConfluencePage> {
    const response: AxiosResponse<ApiResponse<ConfluencePage>> = await api.post('/confluence/pages', data);
    return response.data.data!;
  }

  async getConfluencePages(filters?: {
    type?: string;
    projectId?: string;
    status?: string;
    tags?: string[];
    assignedToMe?: string;
  }): Promise<ConfluencePage[]> {
    const response: AxiosResponse<ApiResponse<ConfluencePage[]>> = await api.get('/confluence/pages', {
      params: filters
    });
    return response.data.data!;
  }

  async getConfluencePage(pageId: string): Promise<ConfluencePage> {
    const response: AxiosResponse<ApiResponse<ConfluencePage>> = await api.get(`/confluence/pages/${pageId}`);
    return response.data.data!;
  }

  async updateConfluencePage(pageId: string, data: {
    title?: string;
    content?: string;
    assignedTo?: string;
    tags?: string[];
    isPublic?: boolean;
    viewPermissions?: string[];
    editPermissions?: string[];
    status?: ConfluencePage['status'];
  }): Promise<ConfluencePage> {
    const response: AxiosResponse<ApiResponse<ConfluencePage>> = await api.put(`/confluence/pages/${pageId}`, data);
    return response.data.data!;
  }

  async deleteConfluencePage(pageId: string): Promise<void> {
    await api.delete(`/confluence/pages/${pageId}`);
  }

  // RBAC-specific methods
  async assignTask(taskId: string, assignedTo: string): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await api.put(`/tasks/${taskId}/assign`, { assignedTo });
    return response.data.data!;
  }

  async updateProjectStatus(projectId: string, status: Project['status']): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${projectId}/status`, { status });
    return response.data.data!;
  }

  async updateMeetingLink(meetingId: string, locationUrl: string): Promise<Meeting> {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.put(`/meetings/${meetingId}/link`, { locationUrl });
    return response.data.data!;
  }

  // Client Dashboard methods
  async getClientDashboardStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/clients/dashboard/stats');
    return response.data.data!;
  }

  async getClientProjects(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/clients/dashboard/projects');
    return response.data.data!;
  }

  async getClientFeedback(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/clients/dashboard/feedback');
    return response.data.data!;
  }

  async getClientRecentActivity(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/clients/dashboard/activity');
    return response.data.data!;
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  }): Promise<{ notifications: any[]; pagination: any; unreadCount: number }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/notifications', { params });
    return response.data.data!;
  }

  async getNotificationSummary(): Promise<{ unreadCount: number; recentNotifications: any[] }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/notifications/summary');
    return response.data.data!;
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data!;
  }

  async markAllNotificationsAsRead(): Promise<{ modifiedCount: number }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.patch('/notifications/mark-all-read');
    return response.data.data!;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }

  async clearAllNotifications(): Promise<{ deletedCount: number }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete('/notifications');
    return response.data.data!;
  }

  async getNotificationPreferences(): Promise<{ preferences: any }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/notifications/preferences');
    return response.data.data!;
  }

  async updateNotificationPreferences(preferences: any): Promise<{ preferences: any }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.put('/notifications/preferences', { preferences });
    return response.data.data!;
  }

  async sendTestNotification(): Promise<void> {
    await api.post('/notifications/test');
  }

  async getNotificationStats(): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    urgentNotifications: number;
    todayNotifications: number;
    connectedUsers: number;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/notifications/stats');
    return response.data.data!;
  }

  async broadcastNotification(data: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    actionable?: boolean;
    action?: string;
    link?: string;
  }): Promise<void> {
    await api.post('/notifications/broadcast', data);
  }
}

export const apiClient = new ApiClient();
export default api;
