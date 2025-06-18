import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface RBACPermissions {
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManageTasks: boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
  canManageCompany: boolean;
  canViewReports: boolean;
  canDeleteData: boolean;
  canInviteUsers: boolean;
  canManageRoles: boolean;
  canCreateProjects: boolean;
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canViewAllProjects: boolean;
  canViewAllTasks: boolean;
  canEditOwnProfile: boolean;
  canViewTeam: boolean;
  canManageMeetings: boolean;
  canManageConfluence: boolean;
  canCreateConfluencePages: boolean; // New permission for creating Confluence pages
  canProvideFeedback: boolean;
  // Task Issues permissions
  canCreateTaskIssues: boolean;
  canCreateTaskIssue: boolean;
  // Role flags
  isAdmin: boolean;
  isProjectManager: boolean;
}

export const useRBAC = (): RBACPermissions => {
  const { profile } = useAuth();

  const permissions = useMemo(() => {
    if (!profile) {
      return {
        canManageUsers: false,
        canManageProjects: false,
        canManageTasks: false,
        canManageTeam: false,
        canManageSettings: false,
        canManageCompany: false,
        canViewReports: false,
        canDeleteData: false,
        canInviteUsers: false,
        canManageRoles: false,
        canCreateProjects: false,
        canCreateTasks: false,
        canAssignTasks: false,
        canViewAllProjects: false,
        canViewAllTasks: false,
        canEditOwnProfile: false,
        canViewTeam: false,
        canManageMeetings: false,
        canManageConfluence: false,
        canCreateConfluencePages: false,
        canProvideFeedback: false,
        canCreateTaskIssues: false,
        canCreateTaskIssue: false,
        isAdmin: false,
        isProjectManager: false,
      };
    }

    const role = profile.role;

    switch (role) {
      case 'admin':
        return {
          canManageUsers: true,
          canManageProjects: true,
          canManageTasks: true,
          canManageTeam: true,
          canManageSettings: true,
          canManageCompany: true,
          canViewReports: true,
          canDeleteData: true,
          canInviteUsers: true,
          canManageRoles: true,
          canCreateProjects: true,
          canCreateTasks: true,
          canAssignTasks: true,
          canViewAllProjects: true,
          canViewAllTasks: true,
          canEditOwnProfile: true,
          canViewTeam: true,
          canManageMeetings: true,
          canManageConfluence: true,
          canCreateConfluencePages: true,
          canProvideFeedback: true,
          canCreateTaskIssues: true,
          canCreateTaskIssue: true,
          isAdmin: true,
          isProjectManager: true,
        };

      case 'project_manager':
        return {
          canManageUsers: false,
          canManageProjects: true,
          canManageTasks: true,
          canManageTeam: true,
          canManageSettings: false,
          canManageCompany: false,
          canViewReports: true,
          canDeleteData: false,
          canInviteUsers: true,
          canManageRoles: false,
          canCreateProjects: true,
          canCreateTasks: true,
          canAssignTasks: true,
          canViewAllProjects: true,
          canViewAllTasks: true,
          canEditOwnProfile: true,
          canViewTeam: true,
          canManageMeetings: true,
          canManageConfluence: true,
          canCreateConfluencePages: true,
          canProvideFeedback: true,
          canCreateTaskIssues: true,
          canCreateTaskIssue: true,
          isAdmin: false,
          isProjectManager: true,
        };

      case 'team_member':
        return {
          canManageUsers: false,
          canManageProjects: false,
          canManageTasks: false,
          canManageTeam: false,
          canManageSettings: false,
          canManageCompany: false,
          canViewReports: false,
          canDeleteData: false,
          canInviteUsers: false,
          canManageRoles: false,
          canCreateProjects: false,
          canCreateTasks: false,
          canAssignTasks: false,
          canViewAllProjects: true,
          canViewAllTasks: true,
          canEditOwnProfile: true,
          canViewTeam: true,
          canManageMeetings: false,
          canManageConfluence: false,
          canCreateConfluencePages: true, // Allow team members to create Confluence pages
          canProvideFeedback: true,
          canCreateTaskIssues: false,
          canCreateTaskIssue: false,
          isAdmin: false,
          isProjectManager: false,
        };

      case 'client':
        return {
          canManageUsers: false,
          canManageProjects: false,
          canManageTasks: false,
          canManageTeam: false,
          canManageSettings: false,
          canManageCompany: false,
          canViewReports: false,
          canDeleteData: false,
          canInviteUsers: false,
          canManageRoles: false,
          canCreateProjects: false,
          canCreateTasks: false,
          canAssignTasks: false,
          canViewAllProjects: false,
          canViewAllTasks: false,
          canEditOwnProfile: true,
          canViewTeam: false,
          canManageMeetings: false,
          canManageConfluence: false,
          canCreateConfluencePages: true, // Allow clients to create Confluence pages
          canProvideFeedback: true,
          canCreateTaskIssues: false,
          canCreateTaskIssue: false,
          isAdmin: false,
          isProjectManager: false,
        };

      case 'accountant':
        return {
          canManageUsers: false,
          canManageProjects: false,
          canManageTasks: false,
          canManageTeam: false,
          canManageSettings: false,
          canManageCompany: false,
          canViewReports: true,
          canDeleteData: false,
          canInviteUsers: false,
          canManageRoles: false,
          canCreateProjects: false,
          canCreateTasks: false,
          canAssignTasks: false,
          canViewAllProjects: false,
          canViewAllTasks: false,
          canEditOwnProfile: true,
          canViewTeam: false,
          canManageMeetings: false,
          canManageConfluence: false,
          canCreateConfluencePages: true, // Allow accountants to create Confluence pages
          canProvideFeedback: true,
          canCreateTaskIssues: false,
          canCreateTaskIssue: false,
          isAdmin: false,
          isProjectManager: false,
        };

      default:
        return {
          canManageUsers: false,
          canManageProjects: false,
          canManageTasks: false,
          canManageTeam: false,
          canManageSettings: false,
          canManageCompany: false,
          canViewReports: false,
          canDeleteData: false,
          canInviteUsers: false,
          canManageRoles: false,
          canCreateProjects: false,
          canCreateTasks: false,
          canAssignTasks: false,
          canViewAllProjects: false,
          canViewAllTasks: false,
          canEditOwnProfile: true,
          canViewTeam: false,
          canManageMeetings: false,
          canManageConfluence: false,
          canCreateConfluencePages: true, // Allow unknown roles to create Confluence pages
          canProvideFeedback: true,
          canCreateTaskIssues: false,
          canCreateTaskIssue: false,
          isAdmin: false,
          isProjectManager: false,
        };
    }
  }, [profile]);

  return permissions;
};

// Utility functions for common permission checks
export const useCanManageProject = (projectId?: string): boolean => {
  const { profile } = useAuth();
  const rbac = useRBAC();

  if (!profile || !rbac.canManageProjects) return false;
  
  // Admin can manage all projects
  if (profile.role === 'admin') return true;
  
  // Project managers can manage projects they're assigned to
  // This would typically check if the user is a member of the specific project
  // For now, we'll allow all project managers to manage projects
  return profile.role === 'project_manager';
};

export const useCanManageTask = (taskId?: string): boolean => {
  const { profile } = useAuth();
  const rbac = useRBAC();

  if (!profile || !rbac.canManageTasks) return false;
  
  // Admin and project managers can manage tasks
  return profile.role === 'admin' || profile.role === 'project_manager';
};

export const useCanAssignTask = (): boolean => {
  const { profile } = useAuth();
  const rbac = useRBAC();

  if (!profile || !rbac.canAssignTasks) return false;
  
  // Admin and project managers can assign tasks
  return profile.role === 'admin' || profile.role === 'project_manager';
};

export const useCanCreateProject = (): boolean => {
  const { profile } = useAuth();
  const rbac = useRBAC();

  if (!profile || !rbac.canCreateProjects) return false;
  
  // Admin and project managers can create projects
  return profile.role === 'admin' || profile.role === 'project_manager';
};

export const useCanInviteUsers = (): boolean => {
  const { profile } = useAuth();
  const rbac = useRBAC();

  if (!profile || !rbac.canInviteUsers) return false;
  
  // Admin and project managers can invite users
  return profile.role === 'admin' || profile.role === 'project_manager';
};

