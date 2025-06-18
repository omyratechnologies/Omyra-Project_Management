import api from './api';

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type: 'team' | 'project' | 'client';
  project?: {
    _id: string;
    title: string;
  };
  organizer: {
    _id: string;
    email: string;
    profile: {
      fullName: string;
    };
  };
  attendees: Array<{
    user: {
      _id: string;
      email: string;
      profile: {
        fullName: string;
      };
    };
    status: 'pending' | 'accepted' | 'declined';
    joinedAt?: Date;
  }>;
  location?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMeetingData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: Meeting['type'];
  projectId?: string;
  attendeeIds: string[];
  location?: string;
  meetingLink?: string;
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  status?: Meeting['status'];
}

export interface MeetingsResponse {
  meetings: Meeting[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const meetingService = {
  async getAllMeetings(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<MeetingsResponse> {
    const response = await api.get<MeetingsResponse>('/meetings', { params });
    return response.data;
  },

  async getMeeting(id: string): Promise<Meeting> {
    const response = await api.get<Meeting>(`/meetings/${id}`);
    return response.data;
  },

  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    const response = await api.post<Meeting>('/meetings', data);
    return response.data;
  },

  async updateMeeting(id: string, data: UpdateMeetingData): Promise<Meeting> {
    const response = await api.put<Meeting>(`/meetings/${id}`, data);
    return response.data;
  },

  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`);
  },

  async respondToInvite(meetingId: string, status: 'accepted' | 'declined'): Promise<void> {
    await api.post(`/meetings/${meetingId}/respond`, { status });
  },

  async addAttendees(meetingId: string, attendeeIds: string[]): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${meetingId}/attendees`, { attendeeIds });
    return response.data;
  },

  async removeAttendee(meetingId: string, attendeeId: string): Promise<Meeting> {
    const response = await api.delete<Meeting>(`/meetings/${meetingId}/attendees/${attendeeId}`);
    return response.data;
  },

  async startMeeting(meetingId: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${meetingId}/start`);
    return response.data;
  },

  async endMeeting(meetingId: string): Promise<Meeting> {
    const response = await api.post<Meeting>(`/meetings/${meetingId}/end`);
    return response.data;
  },

  async getMyMeetings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<MeetingsResponse> {
    const response = await api.get<MeetingsResponse>('/meetings/my-meetings', { params });
    return response.data;
  },

  async recordAttendance(meetingId: string): Promise<void> {
    await api.post(`/meetings/${meetingId}/record-attendance`);
  },

  async getMeetingStatistics(): Promise<{
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    byType: Record<string, number>;
  }> {
    const response = await api.get('/meetings/statistics');
    return response.data;
  }
};

export default meetingService;
