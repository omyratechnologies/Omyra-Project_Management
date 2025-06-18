import api from './api';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  project: {
    _id: string;
    title: string;
  };
  assignedTo?: {
    _id: string;
    email: string;
    profile: {
      fullName: string;
    };
  };
  createdBy: {
    _id: string;
    email: string;
    profile: {
      fullName: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: Task['priority'];
  projectId: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: Task['status'];
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const taskService = {
  async getAllTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    projectId?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<TasksResponse> {
    const response = await api.get<TasksResponse>('/tasks', { params });
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async getMyTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<TasksResponse> {
    const response = await api.get<TasksResponse>('/tasks/my-tasks', { params });
    return response.data;
  },

  async getProjectTasks(projectId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<TasksResponse> {
    const response = await api.get<TasksResponse>(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  async getTaskStatistics(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  }> {
    const response = await api.get('/tasks/statistics');
    return response.data;
  }
};

export default taskService;
