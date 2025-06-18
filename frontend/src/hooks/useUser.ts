import { useAuth } from '@/contexts/AuthContext';

// This is a simple wrapper around useAuth for backward compatibility
// and to provide a more specific interface for user-related operations
export const useUser = () => {
  const { user, profile, loading, refreshProfile } = useAuth();

  return {
    user,
    profile,
    isLoading: loading,
    isAuthenticated: !!user,
    refreshProfile,
    // Add any additional user-specific methods here
    isAdmin: profile?.role === 'admin',
    isProjectManager: profile?.role === 'project_manager',
    isTeamMember: profile?.role === 'team_member',
    fullName: profile?.fullName || '',
    email: profile?.email || user?.email || '',
    avatar: profile?.avatar,
    role: profile?.role,
  };
};
