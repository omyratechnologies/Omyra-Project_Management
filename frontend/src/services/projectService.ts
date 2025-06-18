import api from './api';

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  createdBy: {
    _id: string;
    email: string;
    profile: {
      fullName: string;
    };
  };
  members?: Array<{
    _id: string;
    user: {
      _id: string;
      email: string;
      profile: {
        fullName: string;
      };
    };
    role: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  title: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  teamMembers?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: Project['status'];
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const projectService = {
  async getAllProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ProjectsResponse> {
    const response = await api.get<ProjectsResponse>('/projects', { params });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getProjectMembers(id: string): Promise<Project['members']> {
    const response = await api.get<Project['members']>(`/projects/${id}/members`);
    return response.data;
  },

  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    await api.post(`/projects/${projectId}/members`, { userId, role });
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  async updateProjectMemberRole(projectId: string, userId: string, role: string): Promise<void> {
    await api.put(`/projects/${projectId}/members/${userId}`, { role });
  },

  async getProjectStatistics(): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
  }> {
    const response = await api.get('/projects/statistics');
    return response.data;
  }
};

export default projectService;
