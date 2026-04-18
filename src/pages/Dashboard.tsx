import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user, role, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }

    if (!role) return;

    switch (role) {
      case 'admin':
        navigate("/admin/dashboard", { replace: true });
        break;
      case 'employer':
        (async () => {
          try {
            const { data } = await supabase.from('employer_profiles')
              .select('onboarding_completed')
              .eq('user_id', user?.id || '')
              .maybeSingle();
            if ((data as any)?.onboarding_completed) {
              navigate("/employer/dashboard", { replace: true });
            } else {
              navigate("/employer/onboarding", { replace: true });
            }
          } catch {
            navigate("/employer/onboarding", { replace: true });
          }
        })();
        break;
      case 'worker':
        (async () => {
          try {
            const { data } = await supabase.from('worker_profiles')
              .select('onboarding_completed')
              .eq('user_id', user?.id || '')
              .maybeSingle();
            if ((data as any)?.onboarding_completed) {
              navigate("/worker/dashboard", { replace: true });
            } else {
              navigate("/worker/onboarding", { replace: true });
            }
          } catch {
            navigate("/worker/onboarding", { replace: true });
          }
        })();
        break;
      case 'agent':
        navigate("/agent/dashboard", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  }, [isAuthenticated, role, loading, navigate, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
