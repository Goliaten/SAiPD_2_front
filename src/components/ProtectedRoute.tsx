import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
