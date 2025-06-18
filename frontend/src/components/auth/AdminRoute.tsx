import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile || profile.role !== 'admin') {
    // Redirect to login if not authenticated, or to home if not an admin
    return <Navigate to={profile ? '/' : '/auth/login'} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
