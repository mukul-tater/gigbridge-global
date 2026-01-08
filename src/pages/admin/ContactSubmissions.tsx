import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, Eye, Loader2, Inbox } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

const statusOptions = [
  { value: "new", label: "New", variant: "default" as const },
  { value: "in_progress", label: "In Progress", variant: "secondary" as const },
  { value: "responded", label: "Responded", variant: "outline" as const },
  { value: "closed", label: "Closed", variant: "outline" as const },
];

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const updateData: { status: string; responded_at?: string } = { status: newStatus };
      if (newStatus === 'responded') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => 
        prev.map(s => s.id === id ? { ...s, ...updateData } : s)
      );
      toast.success("Status updated");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status) || statusOptions[0];
    return <Badge variant={option.variant}>{option.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Contact Submissions</h1>
              <Badge variant="secondary" className="ml-2">{submissions.length}</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No contact submissions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(submission.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{submission.subject}</TableCell>
                            <TableCell>
                              <Select
                                value={submission.status}
                                onValueChange={(value) => updateStatus(submission.id, value)}
                                disabled={updatingId === submission.id}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Message Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedSubmission && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">From</p>
                                          <p className="font-medium">{selectedSubmission.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Email</p>
                                          <p className="font-medium">{selectedSubmission.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Date</p>
                                          <p className="font-medium">
                                            {format(new Date(selectedSubmission.created_at), 'PPp')}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Status</p>
                                          {getStatusBadge(selectedSubmission.status)}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-sm">Subject</p>
                                        <p className="font-medium">{selectedSubmission.subject}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-sm mb-1">Message</p>
                                        <div className="bg-muted p-4 rounded-lg">
                                          <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                                        </div>
                                      </div>
                                      <Button
                                        className="w-full"
                                        onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)}
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Reply via Email
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
