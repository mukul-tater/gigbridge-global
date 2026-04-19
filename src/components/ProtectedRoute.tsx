import { Navigate } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import AccessDenied from '@/pages/AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading, profileLoading, needsRoleSelection } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but no role yet (e.g. fresh Google sign-in) — send to
  // /auth so the role-select step can run before any dashboard renders.
  if (needsRoleSelection) {
    return <Navigate to="/auth" replace />;
  }

  // Strict role enforcement — wrong role gets a clear Access Denied page
  // with a button back to their own dashboard. Prevents Workers from
  // landing on Employer pages and vice versa.
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
