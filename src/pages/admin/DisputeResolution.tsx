import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Scale, Clock, CheckCircle, XCircle, AlertTriangle, FileText, MessageSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  title: string;
  description: string;
  dispute_type: string;
  status: string;
  priority: string;
  evidence: any;
  filed_by: string;
  filed_against: string;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  resolution: string | null;
  resolved_at: string | null;
}

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDisputeStatus = async (disputeId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution = resolution;
        updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dispute status updated successfully"
      });

      fetchDisputes();
      setSelectedDispute(null);
      setAdminNotes("");
      setResolution("");
    } catch (error) {
      console.error('Error updating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to update dispute",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'escalated':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Scale className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'open': 'default',
      'under_review': 'secondary',
      'escalated': 'destructive',
      'resolved': 'default',
      'closed': 'outline'
    };

    const colors: Record<string, string> = {
      'resolved': 'bg-green-500',
      'escalated': 'bg-red-500'
    };

    return (
      <Badge variant={variants[status]} className={colors[status] || ''}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">URGENT</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">HIGH</Badge>;
      case 'medium':
        return <Badge variant="secondary">MEDIUM</Badge>;
      default:
        return <Badge variant="outline">LOW</Badge>;
    }
  };

  const filterDisputes = (status: string) => {
    if (status === 'all') return disputes;
    return disputes.filter(d => d.status === status);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading disputes...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispute Resolution Center</h1>
          <p className="text-muted-foreground">Manage and resolve employer-worker disputes</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Scale className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">{disputes.filter(d => d.status === 'open').length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Open Disputes</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">{disputes.filter(d => d.status === 'under_review').length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">{disputes.filter(d => d.priority === 'urgent').length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Urgent</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{disputes.filter(d => d.status === 'resolved').length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({disputes.filter(d => d.status === 'open').length})</TabsTrigger>
            <TabsTrigger value="under_review">Under Review ({disputes.filter(d => d.status === 'under_review').length})</TabsTrigger>
            <TabsTrigger value="escalated">Escalated ({disputes.filter(d => d.status === 'escalated').length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({disputes.filter(d => d.status === 'resolved').length})</TabsTrigger>
          </TabsList>

          {['all', 'open', 'under_review', 'escalated', 'resolved'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterDisputes(status).length === 0 ? (
                <Card className="p-12 text-center">
                  <Scale className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg text-muted-foreground">No {status === 'all' ? '' : status.replace('_', ' ')} disputes</p>
                </Card>
              ) : (
                filterDisputes(status).map((dispute) => (
                  <Card key={dispute.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(dispute.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{dispute.title}</h3>
                            {getStatusBadge(dispute.status)}
                            {getPriorityBadge(dispute.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{dispute.dispute_type.replace('_', ' ').toUpperCase()}</span>
                          </p>
                          <p className="text-sm mb-4 line-clamp-2">{dispute.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Filed: {new Date(dispute.created_at).toLocaleDateString()}</span>
                            {dispute.resolved_at && (
                              <span>Resolved: {new Date(dispute.resolved_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedDispute(dispute)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-3">
                              {getStatusIcon(dispute.status)}
                              {dispute.title}
                            </DialogTitle>
                            <DialogDescription>
                              Dispute #{dispute.id.slice(0, 8)} • Filed {new Date(dispute.created_at).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 mt-6">
                            {/* Dispute Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <h4 className="font-semibold">Dispute Type</h4>
                                </div>
                                <p className="text-sm capitalize">{dispute.dispute_type.replace('_', ' ')}</p>
                              </Card>

                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <h4 className="font-semibold">Priority</h4>
                                </div>
                                {getPriorityBadge(dispute.priority)}
                              </Card>
                            </div>

                            {/* Description */}
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Description
                              </h4>
                              <Card className="p-4">
                                <p className="text-sm">{dispute.description}</p>
                              </Card>
                            </div>

                            {/* Evidence */}
                            {dispute.evidence && (
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Evidence
                                </h4>
                                <Card className="p-4">
                                  <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                                    {JSON.stringify(dispute.evidence, null, 2)}
                                  </pre>
                                </Card>
                              </div>
                            )}

                            {/* Timeline */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Timeline
                              </h4>
                              <div className="space-y-3">
                                <div className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <div className="w-0.5 h-full bg-border mt-1"></div>
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <p className="font-medium">Dispute Filed</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(dispute.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {dispute.status === 'under_review' && (
                                  <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                      <div className="w-0.5 h-full bg-border mt-1"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                      <p className="font-medium">Under Review</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(dispute.updated_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {dispute.resolved_at && (
                                  <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">Resolved</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(dispute.resolved_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Admin Notes */}
                            {dispute.admin_notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Previous Admin Notes</h4>
                                <Card className="p-4 bg-muted">
                                  <p className="text-sm">{dispute.admin_notes}</p>
                                </Card>
                              </div>
                            )}

                            {/* Resolution */}
                            {dispute.resolution && (
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Resolution
                                </h4>
                                <Card className="p-4 bg-green-500/10 border-green-500/20">
                                  <p className="text-sm">{dispute.resolution}</p>
                                </Card>
                              </div>
                            )}

                            {/* Action Form */}
                            {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                              <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-semibold">Take Action</h4>

                                <div className="space-y-3">
                                  <div>
                                    <Label>Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="escalated">Escalated</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Admin Notes</Label>
                                    <Textarea
                                      placeholder="Add your notes about this dispute..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  {(newStatus === 'resolved' || newStatus === 'closed') && (
                                    <div>
                                      <Label>Resolution Summary</Label>
                                      <Textarea
                                        placeholder="Describe how this dispute was resolved..."
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                  )}

                                  <Button
                                    onClick={() => updateDisputeStatus(dispute.id, newStatus)}
                                    disabled={!newStatus}
                                    className="w-full"
                                  >
                                    Update Dispute Status
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
