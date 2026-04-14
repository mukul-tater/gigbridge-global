import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user, role, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (role) {
        switch (role) {
          case 'admin':
            navigate("/admin/dashboard");
            break;
          case 'employer':
            navigate("/employer/dashboard");
            break;
          case 'worker':
            // Check onboarding
            (async () => {
              try {
                const { data } = await supabase.from('worker_profiles')
                  .select('onboarding_completed')
                  .eq('user_id', user?.id || '')
                  .maybeSingle();
                if ((data as any)?.onboarding_completed) {
                  navigate("/worker/dashboard");
                } else {
                  navigate("/worker/onboarding");
                }
              } catch {
                navigate("/worker/onboarding");
              }
            })();
            break;
          case 'agent':
            navigate("/agent/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    }
  }, [isAuthenticated, role, loading, navigate, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );

}
