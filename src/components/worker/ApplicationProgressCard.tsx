import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, XCircle, Briefcase, ChevronRight, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Formality {
  visa_status: string | null;
  visa_required: boolean | null;
  overall_status: string | null;
  completion_percentage: number | null;
}

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
  formality: Formality | null;
}

// 5-stage flow per product spec
const APPLICATION_STAGES = [
  { key: "APPLIED", label: "Applied" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "SELECTED", label: "Selected" },
  { key: "VISA", label: "Visa in process" },
];

/**
 * Determine the current stage index (0-4) from application status + formality.
 * - PENDING/APPLIED → 0
 * - SHORTLISTED → 1
 * - INTERVIEWED/INTERVIEWING → 2
 * - APPROVED/HIRED (without active visa progress) → 3
 * - APPROVED/HIRED with visa formality in progress or completed → 4
 * - REJECTED → -1
 */
function getStageIndex(app: Application): number {
  if (app.status === "REJECTED") return -1;

  const visaActive =
    app.formality?.visa_required &&
    app.formality?.visa_status &&
    app.formality.visa_status !== "NOT_STARTED";

  switch (app.status) {
    case "PENDING":
    case "APPLIED":
      return 0;
    case "SHORTLISTED":
      return 1;
    case "INTERVIEWED":
    case "INTERVIEWING":
      return 2;
    case "APPROVED":
    case "HIRED":
      return visaActive ? 4 : 3;
    default:
      return 0;
  }
}

function getProgressPercent(app: Application): number {
  if (app.status === "REJECTED") return 100;
  // If visa stage is active, use formality completion if available
  const idx = getStageIndex(app);
  if (idx === 4 && app.formality?.completion_percentage != null) {
    // Final stage: scale 80% (entering stage 5) → 100% based on visa completion
    return 80 + Math.round((app.formality.completion_percentage / 100) * 20);
  }
  return Math.round(((idx + 1) / APPLICATION_STAGES.length) * 100);
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

function getDisplayStatus(app: Application): string {
  const idx = getStageIndex(app);
  if (idx === -1) return "REJECTED";
  return APPLICATION_STAGES[idx].label;
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
    const appIds = apps.map((a) => a.id);

    const [jobsRes, formalitiesRes] = await Promise.all([
      supabase.from("jobs").select("id, title, location, country").in("id", jobIds),
      supabase
        .from("job_formalities")
        .select("application_id, visa_status, visa_required, overall_status, completion_percentage")
        .in("application_id", appIds),
    ]);

    const jobMap = new Map((jobsRes.data || []).map((j) => [j.id, j]));
    const formalityMap = new Map(
      (formalitiesRes.data || []).map((f: any) => [f.application_id, f as Formality])
    );

    const merged: Application[] = apps.map((a) => ({
      ...a,
      jobs: jobMap.get(a.job_id) || null,
      formality: formalityMap.get(a.id) || null,
    }));
    setApplications(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchApplications();
  }, [userId]);

  // Real-time subscription for application + formality updates
  useEffect(() => {
    if (!userId) return;
    const appsChannel = supabase
      .channel("worker-application-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_applications", filter: `worker_id=eq.${userId}` },
        () => fetchApplications()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_formalities", filter: `worker_id=eq.${userId}` },
        () => fetchApplications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(appsChannel);
    };
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
          const currentIdx = getStageIndex(app);
          const isRejected = currentIdx === -1;
          const progress = getProgressPercent(app);

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
                  {getDisplayStatus(app)}
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
                  const isVisaStage = idx === 4;

                  return (
                    <div key={stage.key} className="flex flex-col items-center flex-1 min-w-0">
                      {isRejected ? (
                        idx === 0 ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )
                      ) : isComplete ? (
                        isVisaStage && isCurrent ? (
                          <Plane className={`h-4 w-4 text-primary animate-pulse`} />
                        ) : (
                          <CheckCircle className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-green-500"}`} />
                        )
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

              {/* Visa progress sub-bar */}
              {currentIdx === 4 && app.formality && (
                <div className="p-2 bg-primary/10 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <Plane className="h-3 w-3" /> Visa: {(app.formality.visa_status || "NOT_STARTED").replace(/_/g, " ")}
                    </span>
                    <span className="text-muted-foreground">{app.formality.completion_percentage ?? 0}%</span>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
                  Application was not selected. Keep trying!
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                <Link
                  to={`/worker/application-tracking`}
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
