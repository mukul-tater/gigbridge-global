import { Navigate } from 'react-router-dom';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface WorkerProtectedRouteProps {
  children: React.ReactNode;
}

export default function WorkerProtectedRoute({ children }: WorkerProtectedRouteProps) {
  const { isAuthenticated, loading } = useWorkerAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
