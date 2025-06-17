import { Types } from 'mongoose';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  profile?: Types.ObjectId; // Reference to Profile
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProfile {
  _id?: string;
  user: Types.ObjectId; // Reference to User
  fullName: string;
  email: string;
  role: UserRole;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id?: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  createdBy: Types.ObjectId; // Reference to User
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectMember {
  _id?: string;
  project: Types.ObjectId; // Reference to Project
  user: Types.ObjectId; // Reference to User
  roleInProject: string;
  joinedAt?: Date;
}

export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Types.ObjectId; // Reference to Project
  assignedTo?: Types.ObjectId; // Reference to User
  createdBy: Types.ObjectId; // Reference to User
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = 'admin' | 'project_manager' | 'team_member';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  projectId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  roleInProject?: string;
}
