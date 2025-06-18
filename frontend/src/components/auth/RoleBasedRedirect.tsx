import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or not authenticated
    if (loading || !profile) return;

    // Only redirect from the root path to avoid infinite loops
    if (location.pathname !== '/') return;

    // Redirect clients to their specific dashboard
    if (profile.role === 'client') {
      navigate('/client-dashboard', { replace: true });
    }
  }, [profile, loading, navigate, location.pathname]);

  // Show loading or children
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
