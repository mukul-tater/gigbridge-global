import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Application {
  id: string;
  job_id: string;
  status: string;
  cover_letter: string | null;
  applied_at: string;
  updated_at: string;
}

export default function WorkerApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("worker_id", user?.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "default";
      case "REVIEWING": return "secondary";
      case "SHORTLISTED": return "default";
      case "INTERVIEWED": return "secondary";
      case "OFFERED": return "default";
      case "HIRED": return "default";
      case "REJECTED": return "destructive";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <WorkerSidebar />
        <main className="flex-1 p-8">
          <div className="text-center">Loading applications...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              Start applying to jobs to see your applications here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">Job ID: {app.job_id}</h3>
                    {app.cover_letter && (
                      <p className="text-muted-foreground mb-2 line-clamp-2">
                        {app.cover_letter}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusColor(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {format(new Date(app.applied_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
