import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Star, User, Calendar, Search } from "lucide-react";

interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
  cover_letter: string | null;
  applied_at: string;
  notes: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export default function ApplicationReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, searchQuery]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          profiles!job_applications_worker_id_fkey (full_name, email, avatar_url)
        `)
        .eq("employer_id", user?.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data as any || []);
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

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated",
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateNotes = async () => {
    if (!selectedApp) return;

    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ notes })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notes saved",
      });

      fetchApplications();
      setSelectedApp(null);
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addToShortlist = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from("shortlisted_workers")
        .insert({
          employer_id: user?.id,
          worker_id: workerId,
          list_name: "General",
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Shortlisted",
            description: "This worker is already in your shortlist",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Worker added to shortlist",
      });
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
      case "PENDING": return "default";
      case "REVIEWING": return "secondary";
      case "APPROVED": return "default";
      case "SHORTLISTED": return "default";
      case "INTERVIEWED": return "secondary";
      case "OFFERED": return "default";
      case "HIRED": return "default";
      case "REJECTED": return "destructive";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <EmployerHeader />
        <div className="flex flex-1">
          <EmployerSidebar />
          <main className="flex-1 p-8">
            <div className="text-center">Loading applications...</div>
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
          <h1 className="text-3xl font-bold">Application Review</h1>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Applications</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWING">Reviewing</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
              <SelectItem value="OFFERED">Offered</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
            <p className="text-muted-foreground">
              {statusFilter !== "ALL" 
                ? "Try adjusting your filters"
                : "Applications will appear here when workers apply to your jobs"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {app.profiles?.avatar_url ? (
                        <img src={app.profiles.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {app.profiles?.full_name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {app.profiles?.email}
                      </p>
                      {app.cover_letter && (
                        <p className="text-sm mb-3 line-clamp-2">{app.cover_letter}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge variant={getStatusColor(app.status)}>
                          {getStatusLabel(app.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(app.applied_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'APPROVED')}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateApplicationStatus(app.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWING">Reviewing</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
                        <SelectItem value="OFFERED">Offered</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToShortlist(app.worker_id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Shortlist
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setNotes(app.notes || "");
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Application Notes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Add notes about this application..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={6}
                          />
                          <Button onClick={updateNotes} className="w-full">
                            Save Notes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
