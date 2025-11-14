import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Briefcase, Plus, Eye, Trash2, MapPin, Users, Calendar } from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  country: string;
  job_type: string;
  openings: number;
  status: string;
  posted_at: string | null;
  expires_at: string | null;
  created_at: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
}

export default function ManageJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "ACTIVE" && !jobs.find(j => j.id === jobId)?.posted_at) {
        updateData.posted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job status updated",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default";
      case "DRAFT": return "secondary";
      case "PAUSED": return "outline";
      case "CLOSED": return "destructive";
      case "EXPIRED": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    const symbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
      SAR: "﷼",
      QAR: "ر.ق",
    };

    const symbol = symbols[currency] || currency;

    if (!min && !max) return "Salary not specified";
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `From ${symbol}${min.toLocaleString()}`;
    return `Up to ${symbol}${max!.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <EmployerHeader />
        <div className="flex flex-1">
          <EmployerSidebar />
          <main className="flex-1 p-8">
            <div className="text-center">Loading jobs...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <Button onClick={() => navigate("/employer/post-job")}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Jobs Posted Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by posting your first job to attract skilled workers
            </p>
            <Button onClick={() => navigate("/employer/post-job")}>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}, {job.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.openings} {job.openings === 1 ? "opening" : "openings"}
                      </span>
                      {job.posted_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {format(new Date(job.posted_at), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={getStatusColor(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                      <span className="text-sm font-medium">
                        {job.job_type.replace("_", " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatSalary(job.salary_min, job.salary_max, job.currency)}
                      </span>
                    </div>

                    {job.expires_at && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(job.expires_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Select
                      value={job.status}
                      onValueChange={(value) => updateJobStatus(job.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this job? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteJob(job.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
