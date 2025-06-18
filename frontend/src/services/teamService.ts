import api from './api';

export interface TeamMember {
  _id: string;
  email: string;
  profile: {
    fullName: string;
    role: string;
    department?: string;
    avatar?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  projects?: Array<{
    _id: string;
    title: string;
    role: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamMemberData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  department?: string;
}

export interface UpdateTeamMemberData {
  fullName?: string;
  role?: string;
  department?: string;
  status?: TeamMember['status'];
}

export interface TeamMembersResponse {
  members: TeamMember[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const teamService = {
  async getAllMembers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<TeamMembersResponse> {
    const response = await api.get<TeamMembersResponse>('/team', { params });
    return response.data;
  },

  async getMember(id: string): Promise<TeamMember> {
    const response = await api.get<TeamMember>(`/team/${id}`);
    return response.data;
  },

  async createMember(data: CreateTeamMemberData): Promise<TeamMember> {
    const response = await api.post<TeamMember>('/team', data);
    return response.data;
  },

  async updateMember(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
    const response = await api.put<TeamMember>(`/team/${id}`, data);
    return response.data;
  },

  async deleteMember(id: string): Promise<void> {
    await api.delete(`/team/${id}`);
  },

  async getMemberProjects(id: string): Promise<TeamMember['projects']> {
    const response = await api.get(`/team/${id}/projects`);
    return response.data;
  },

  async inviteMember(email: string, role: string, department?: string): Promise<void> {
    await api.post('/team/invite', { email, role, department });
  },

  async getTeamStatistics(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    const response = await api.get('/team/statistics');
    return response.data;
  },

  async updateMemberStatus(id: string, status: TeamMember['status']): Promise<TeamMember> {
    const response = await api.put<TeamMember>(`/team/${id}/status`, { status });
    return response.data;
  }
};

export default teamService;
