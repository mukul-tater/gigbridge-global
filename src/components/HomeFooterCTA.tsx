import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeFooterCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSignUp = () => {
    navigate(isAuthenticated ? "/jobs" : "/worker/quick-signup");
  };

  return (
    <section className="py-14 sm:py-16 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-3 tracking-tight">
          Ready to work abroad safely?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {isAuthenticated
            ? "Browse verified jobs and apply in minutes."
            : "Sign up free — no agent fees, no upfront cost."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="h-12 px-8 rounded-xl gap-2"
            onClick={handleSignUp}
          >
            {isAuthenticated ? "Browse Jobs" : "Sign Up Free"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 rounded-xl"
            onClick={() => navigate("/jobs")}
          >
            View All Jobs
          </Button>
        </div>
      </div>
    </section>
  );
}
