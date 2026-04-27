import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  location: string | null;
  country: string | null;
}

interface SendJobRequestDialogProps {
  workerId: string;
  workerName?: string | null;
  trigger: React.ReactNode;
}

export default function SendJobRequestDialog({ workerId, workerName, trigger }: SendJobRequestDialogProps) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && user && role === "employer") {
      loadJobs();
    }
  }, [open, user, role]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, location, country, status")
        .eq("employer_id", user!.id)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setJobs(data || []);
      if (data && data.length === 1) setSelectedJobId(data[0].id);
    } catch (err: any) {
      toast.error(err.message || "Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!user) return;
    if (!selectedJobId) {
      toast.error("Please choose a job");
      return;
    }
    if (!message.trim()) {
      toast.error("Please add a short message");
      return;
    }
    const job = jobs.find((j) => j.id === selectedJobId);
    setSending(true);
    try {
      const subject = `Job opportunity: ${job?.title || "Open role"}`;
      const { error: msgErr } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: workerId,
        job_id: selectedJobId,
        subject,
        content: message.trim(),
      });
      if (msgErr) throw msgErr;

      // Best-effort notification (non-blocking on failure)
      await supabase.from("notifications").insert({
        user_id: workerId,
        type: "job_request",
        title: "New job invitation",
        message: `An employer invited you to apply for "${job?.title}".`,
        data: { job_id: selectedJobId, employer_id: user.id },
      });

      toast.success(`Request sent${workerName ? ` to ${workerName}` : ""}`);
      setOpen(false);
      setMessage("");
      setSelectedJobId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (role !== "employer") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Send job request
          </DialogTitle>
          <DialogDescription>
            Invite {workerName || "this worker"} to apply for one of your active jobs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Choose a job</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your jobs…
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have no active jobs. Post a job first to send a request.
              </p>
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an active job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                      {job.location ? ` · ${job.location}` : ""}
                      {job.country ? `, ${job.country}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              rows={5}
              placeholder="Hi, your profile fits a role we're hiring for. We'd love you to apply…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !selectedJobId || !message.trim() || jobs.length === 0}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}