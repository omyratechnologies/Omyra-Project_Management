import axios, { AxiosResponse } from 'axios';

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
    role: 'admin' | 'project_manager' | 'team_member';
    avatar?: string;
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

export interface Profile {
  _id: string;
  user: any;
  fullName: string;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

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
  async getTeamMembers(projectId?: string): Promise<Profile[]> {
    const params = projectId ? { projectId } : {};
    const response: AxiosResponse<ApiResponse<Profile[]>> = await api.get('/team', { params });
    return response.data.data!;
  }

  async getTeamMember(id: string): Promise<Profile> {
    const response: AxiosResponse<ApiResponse<Profile>> = await api.get(`/team/${id}`);
    return response.data.data!;
  }

  async updateTeamMember(id: string, data: {
    fullName?: string;
    role?: Profile['role'];
    avatar?: string;
  }): Promise<Profile> {
    const response: AxiosResponse<ApiResponse<Profile>> = await api.put(`/team/${id}`, data);
    return response.data.data!;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await api.delete(`/team/${id}`);
  }
}

export const apiClient = new ApiClient();
export default api;
