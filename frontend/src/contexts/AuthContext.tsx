import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: User['profile'] | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // RBAC helpers
  isAdmin: boolean;
  isProjectManager: boolean;
  isTeamMember: boolean;
  isClient: boolean;
  canManageProjects: boolean;
  canAssignTasks: boolean;
  canManageMeetings: boolean;
  canDeleteMeetings: boolean;
  canChangeProjectStatus: boolean;
  canCreateTaskIssues: boolean;
  canProvideFeedback: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User['profile'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token and user data
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setProfile(userData.profile);
        setToken(savedToken);
        
        // Verify token is still valid by fetching profile
        apiClient.getProfile()
          .then(({ user: currentUser }) => {
            setUser(currentUser);
            setProfile(currentUser.profile);
            localStorage.setItem('user', JSON.stringify(currentUser));
          })
          .catch(() => {
            // Token is invalid, clear everything
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setProfile(null);
            setToken(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        // Invalid saved user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const authResponse = await apiClient.register(email, password, fullName);
      
      // Store token and user data
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      setProfile(authResponse.user.profile);
      setToken(authResponse.token);
      
      toast({
        title: "Success",
        description: "Account created successfully! Welcome to Omyra."
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const authResponse = await apiClient.login(email, password);
      
      // Store token and user data
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
      setProfile(authResponse.user.profile);
      setToken(authResponse.token);
      
      toast({
        title: "Success",
        description: "Welcome back!"
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear state
      setUser(null);
      setProfile(null);
      setToken(null);
      
      toast({
        title: "Success",
        description: "You have been signed out."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    }
  };

  const refreshProfile = async () => {
    try {
      const { user: currentUser } = await apiClient.getProfile();
      setUser(currentUser);
      setProfile(currentUser.profile);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const userRole = user?.profile?.role;

  const value = {
    user,
    profile,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    // RBAC helpers
    isAdmin: userRole === 'admin',
    isProjectManager: userRole === 'project_manager',
    isTeamMember: userRole === 'team_member',
    isClient: userRole === 'client',
    canManageProjects: userRole === 'admin' || userRole === 'project_manager',
    canAssignTasks: userRole === 'admin' || userRole === 'project_manager',
    canManageMeetings: userRole === 'admin' || userRole === 'project_manager',
    canDeleteMeetings: userRole === 'admin',
    canChangeProjectStatus: userRole === 'admin',
    canCreateTaskIssues: userRole === 'admin' || userRole === 'project_manager' || userRole === 'team_member',
    canProvideFeedback: userRole === 'client',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
