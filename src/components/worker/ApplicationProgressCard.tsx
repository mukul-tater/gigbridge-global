import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, XCircle, Briefcase, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  jobs: {
    title: string;
    location: string;
    country: string;
  } | null;
}

const APPLICATION_STAGES = [
  { key: "PENDING", label: "Applied" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEWED", label: "Interview" },
  { key: "APPROVED", label: "Approved" },
  { key: "HIRED", label: "Hired" },
];

function getStageIndex(status: string): number {
  if (status === "REJECTED") return -1;
  const idx = APPLICATION_STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function getProgressPercent(status: string): number {
  if (status === "REJECTED") return 100;
  const idx = getStageIndex(status);
  return Math.round(((idx + 1) / APPLICATION_STAGES.length) * 100);
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPROVED":
    case "HIRED":
      return "text-green-500";
    case "REJECTED":
      return "text-destructive";
    case "SHORTLISTED":
    case "INTERVIEWED":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
    case "HIRED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function ApplicationProgressCard({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    const { data: apps } = await supabase
      .from("job_applications")
      .select("id, job_id, status, applied_at, updated_at")
      .eq("worker_id", userId)
      .order("applied_at", { ascending: false });

    if (!apps || apps.length === 0) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const jobIds = [...new Set(apps.map((a) => a.job_id))];
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, location, country")
      .in("id", jobIds);

    const jobMap = new Map((jobs || []).map((j) => [j.id, j]));
    const merged: Application[] = apps.map((a) => ({
      ...a,
      jobs: jobMap.get(a.job_id) || null,
    }));
    setApplications(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchApplications();
  }, [userId]);

  // Real-time subscription for application status updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("worker-application-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "job_applications", filter: `worker_id=eq.${userId}` },
        () => {
          fetchApplications();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" /> Application Tracker
        </h2>
        <p className="text-muted-foreground text-sm text-center py-6">
          No applications yet.{" "}
          <Link to="/jobs" className="text-primary underline">Browse jobs</Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" /> Application Tracker
      </h2>
      <div className="space-y-4">
        {applications.map((app) => {
          const currentIdx = getStageIndex(app.status);
          const isRejected = app.status === "REJECTED";
          const progress = getProgressPercent(app.status);

          return (
            <div key={app.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{app.jobs?.title || "Job"}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {app.jobs?.location}, {app.jobs?.country}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(app.status)} className="shrink-0 text-xs">
                  {app.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <Progress
                value={progress}
                className={`h-2 ${isRejected ? "[&>div]:bg-destructive" : ""}`}
              />

              {/* Stage indicators */}
              <div className="flex items-center justify-between gap-1">
                {APPLICATION_STAGES.map((stage, idx) => {
                  const isComplete = !isRejected && idx <= currentIdx;
                  const isCurrent = !isRejected && idx === currentIdx;

                  return (
                    <div key={stage.key} className="flex flex-col items-center flex-1 min-w-0">
                      {isRejected ? (
                        idx === 0 ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )
                      ) : isComplete ? (
                        <CheckCircle className={`h-4 w-4 ${isCurrent ? getStatusColor(app.status) : "text-green-500"}`} />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                      <span className={`text-[10px] mt-1 text-center leading-tight ${
                        isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isRejected && (
                <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
                  Application was not selected. Keep trying!
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                <Link
                  to={`/worker/applications/${app.id}`}
                  className="text-primary flex items-center gap-0.5 hover:underline"
                >
                  Details <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
