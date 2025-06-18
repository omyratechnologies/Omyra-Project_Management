export interface TeamMember {
  id: string;
  userId?: string; // The actual user ID for backend operations
  email: string;
  fullName: string;
  role: 'admin' | 'project_manager' | 'team_member';
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberStats {
  projects: number;
  tasks: number;
  completedTasks: number;
  completionRate: number;
}
