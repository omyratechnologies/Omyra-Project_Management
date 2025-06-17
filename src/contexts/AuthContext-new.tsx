import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: User['profile'] | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token and user data
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setProfile(userData.profile);
        
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
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        // Invalid saved user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
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

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
