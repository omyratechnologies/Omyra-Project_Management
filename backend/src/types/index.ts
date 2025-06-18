import { Types } from 'mongoose';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  status?: 'active' | 'inactive' | 'suspended';
  profile?: Types.ObjectId; // Reference to Profile
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProfile {
  _id?: string;
  user: Types.ObjectId; // Reference to User
  fullName: string;
  role: UserRole;
  department?: string;
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

export interface IMeeting {
  _id?: string;
  title: string;
  description?: string;
  project: Types.ObjectId; // Reference to Project
  scheduledAt: Date;
  duration: number; // in minutes
  organizer: Types.ObjectId; // Reference to User
  attendees: Types.ObjectId[]; // References to Users
  locationUrl?: string; // For virtual meetings
  status: MeetingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'client';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export type AttendeeStatus = 'attending' | 'not_attending' | 'tentative';

export type TaskIssueType = 'bug' | 'blocker' | 'clarification' | 'resource_needed' | 'other';

export type TaskIssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackType = 'general' | 'feature_request' | 'bug_report' | 'improvement';

export type ConfluencePageType = 'feature' | 'documentation' | 'process' | 'meeting_notes';

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: UserRole;
  status?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  status?: ProjectStatus;
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

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  projectId: string;
  scheduledAt: string;
  duration: number;
  attendees: string[];
  locationUrl?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  attendees?: string[];
  locationUrl?: string;
  status?: MeetingStatus;
}

export interface ITaskIssue {
  _id?: string;
  task: Types.ObjectId;
  reportedBy: Types.ObjectId;
  title: string;
  description: string;
  type: TaskIssueType;
  priority: TaskIssuePriority;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: Types.ObjectId;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMeetingAttendee {
  _id?: string;
  meeting: Types.ObjectId;
  user: Types.ObjectId;
  status: AttendeeStatus;
  reason?: string; // For not attending
  joinedAt?: Date;
  leftAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClientFeedback {
  _id?: string;
  project: Types.ObjectId;
  client: Types.ObjectId;
  type: FeedbackType;
  title: string;
  description: string;
  priority: TaskPriority;
  status: 'open' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: Types.ObjectId;
  response?: string;
  respondedBy?: Types.ObjectId;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConfluencePage {
  _id?: string;
  title: string;
  content: string;
  type: ConfluencePageType;
  project?: Types.ObjectId;
  createdBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
  tags: string[];
  isPublic: boolean;
  viewPermissions: UserRole[];
  editPermissions: UserRole[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  parentPage?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTaskIssueRequest {
  title: string;
  description: string;
  type: TaskIssueType;
  priority: TaskIssuePriority;
}

export interface UpdateTaskIssueRequest {
  title?: string;
  description?: string;
  type?: TaskIssueType;
  priority?: TaskIssuePriority;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
}

export interface CreateClientFeedbackRequest {
  type: FeedbackType;
  title: string;
  description: string;
  priority: TaskPriority;
}

export interface UpdateClientFeedbackRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: 'open' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
}

export interface CreateConfluencePageRequest {
  title: string;
  content: string;
  type: ConfluencePageType;
  projectId?: string;
  tags: string[];
  isPublic: boolean;
  viewPermissions: UserRole[];
  editPermissions: UserRole[];
  parentPageId?: string;
}

export interface UpdateConfluencePageRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
  viewPermissions?: UserRole[];
  editPermissions?: UserRole[];
  status?: 'draft' | 'published' | 'archived';
}

export interface MeetingAttendanceRequest {
  status: AttendeeStatus;
  reason?: string;
}

export interface IClient {
  _id?: string;
  user: Types.ObjectId; // Reference to User
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPerson: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  projects?: Types.ObjectId[]; // References to Projects
  notes?: string;
  billingInfo?: {
    billingEmail?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    paymentTerms?: 'net-15' | 'net-30' | 'net-60' | 'immediate';
  };
  createdAt?: Date;
  updatedAt?: Date;
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
    country?: string;
    zipCode?: string;
  };
  contactPerson: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
  };
  billingInfo?: {
    billingEmail?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    paymentTerms?: 'net-15' | 'net-30' | 'net-60' | 'immediate';
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
    country?: string;
    zipCode?: string;
  };
  contactPerson?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
  };
  status?: 'active' | 'inactive' | 'pending';
  billingInfo?: {
    billingEmail?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    paymentTerms?: 'net-15' | 'net-30' | 'net-60' | 'immediate';
  };
  notes?: string;
}
