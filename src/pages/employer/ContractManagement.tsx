import { useState, useEffect } from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSignature,
  Send,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  FileText,
  User,
  Building2,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ContractVersionHistory from "@/components/ContractVersionHistory";

interface ContractRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  jobTitle: string;
  jobLocation: string;
  jobCountry: string;
  salary: string;
  contractSent: boolean;
  contractSigned: boolean;
  contractSignedDate: string | null;
  contractUrl: string | null;
  expectedJoiningDate: string | null;
  contractExpiryDate: string | null;
  createdAt: string;
}

export default function ContractManagement() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sendingDialogOpen, setSendingDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      // First get jobs belonging to this employer
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", user?.id);

      if (jobsError) throw jobsError;

      if (!jobs || jobs.length === 0) {
        setContracts([]);
        setLoading(false);
        return;
      }

      const jobIds = jobs.map((j) => j.id);

      // Fetch formalities for these jobs
      const { data, error } = await supabase
        .from("job_formalities")
        .select(`
          id,
          worker_id,
          contract_sent,
          contract_signed,
          contract_signed_date,
          contract_url,
          expected_joining_date,
          contract_expiry_date,
          created_at,
          jobs (
            id,
            title,
            location,
            country,
            salary_min,
            salary_max,
            currency
          )
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch worker profiles
      const workerIds = [...new Set((data || []).map((d) => d.worker_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", workerIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        (profiles || []).map((p) => [p.id, { name: p.full_name, email: p.email }])
      );

      const formattedContracts: ContractRecord[] = (data || []).map((item) => {
        const job = item.jobs as any;
        const workerInfo = profileMap.get(item.worker_id) || { name: "Unknown", email: "" };
        const salaryRange =
          job?.salary_min && job?.salary_max
            ? `${job.salary_min} - ${job.salary_max} ${job.currency}/month`
            : "Not specified";

        return {
          id: item.id,
          workerId: item.worker_id,
          workerName: workerInfo.name || "Unknown Worker",
          workerEmail: workerInfo.email || "",
          jobTitle: job?.title || "Unknown Position",
          jobLocation: job?.location || "",
          jobCountry: job?.country || "",
          salary: salaryRange,
          contractSent: item.contract_sent || false,
          contractSigned: item.contract_signed || false,
          contractSignedDate: item.contract_signed_date,
          contractUrl: item.contract_url,
          expectedJoiningDate: item.expected_joining_date,
          contractExpiryDate: item.contract_expiry_date,
          createdAt: item.created_at,
        };
      });

      setContracts(formattedContracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (contract: ContractRecord) => {
    if (contract.contractSigned) {
      return <Badge className="bg-green-500">Signed</Badge>;
    }
    if (contract.contractSent) {
      return <Badge className="bg-amber-500">Awaiting Signature</Badge>;
    }
    return <Badge variant="outline">Not Sent</Badge>;
  };

  const openSendDialog = (contract: ContractRecord) => {
    setSelectedContract(contract);
    // Set default expiry date to 7 days from now
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
    setSendingDialogOpen(true);
  };

  const handleSendContract = async () => {
    if (!selectedContract) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from("job_formalities")
        .update({
          contract_sent: true,
          contract_expiry_date: expiryDate || null,
          contract_reminder_sent: false,
        })
        .eq("id", selectedContract.id);

      if (error) throw error;

      // Create notification for worker
      await supabase.from("notifications").insert({
        user_id: selectedContract.workerId,
        type: "contract",
        title: "New Contract Available",
        message: `A contract for ${selectedContract.jobTitle} has been sent for your signature.`,
        data: { formality_id: selectedContract.id },
      });

      setContracts((prev) =>
        prev.map((c) =>
          c.id === selectedContract.id ? { ...c, contractSent: true } : c
        )
      );

      setSendingDialogOpen(false);
      toast.success(`Contract sent to ${selectedContract.workerName}`);
    } catch (error) {
      console.error("Error sending contract:", error);
      toast.error("Failed to send contract");
    } finally {
      setIsSending(false);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.workerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "signed") {
      matchesStatus = contract.contractSigned;
    } else if (statusFilter === "pending") {
      matchesStatus = contract.contractSent && !contract.contractSigned;
    } else if (statusFilter === "not_sent") {
      matchesStatus = !contract.contractSent;
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    signed: contracts.filter((c) => c.contractSigned).length,
    pending: contracts.filter((c) => c.contractSent && !c.contractSigned).length,
    notSent: contracts.filter((c) => !c.contractSent).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <EmployerSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contract Management</h1>
          <p className="text-muted-foreground">
            Send contracts to workers and track their signing status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.signed}</p>
                <p className="text-sm text-muted-foreground">Signed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Awaiting Signature</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-lg">
                <Send className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notSent}</p>
                <p className="text-sm text-muted-foreground">Not Sent</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by worker name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contracts</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="pending">Awaiting Signature</SelectItem>
              <SelectItem value="not_sent">Not Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Contracts Found</h3>
            <p className="text-muted-foreground">
              {contracts.length === 0
                ? "Contracts will appear here when job applications are approved."
                : "No contracts match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{contract.workerName}</h3>
                          <p className="text-sm text-muted-foreground">{contract.workerEmail}</p>
                        </div>
                        {getStatusBadge(contract)}
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Position</p>
                          <p className="font-medium">{contract.jobTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {contract.jobLocation}, {contract.jobCountry}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Salary</p>
                          <p className="font-medium">{contract.salary}</p>
                        </div>
                        {contract.expectedJoiningDate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Expected Start</p>
                            <p className="font-medium">{contract.expectedJoiningDate}</p>
                          </div>
                        )}
                      </div>

                      {contract.contractSignedDate && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Signed on{" "}
                            {new Date(contract.contractSignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {contract.contractSent && !contract.contractSigned && contract.contractExpiryDate && (
                        <div className={`flex items-center gap-2 mt-4 text-sm ${
                          new Date(contract.contractExpiryDate) < new Date() 
                            ? "text-destructive" 
                            : new Date(contract.contractExpiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }`}>
                          {new Date(contract.contractExpiryDate) < new Date() ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <CalendarClock className="h-4 w-4" />
                          )}
                          <span>
                            {new Date(contract.contractExpiryDate) < new Date() 
                              ? `Expired on ${new Date(contract.contractExpiryDate).toLocaleDateString()}`
                              : `Expires on ${new Date(contract.contractExpiryDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <ContractVersionHistory
                      formalityId={contract.id}
                      isEmployer={true}
                      onVersionUploaded={fetchContracts}
                    />
                    {!contract.contractSent && (
                      <Button onClick={() => openSendDialog(contract)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Contract
                      </Button>
                    )}
                    {contract.contractSent && !contract.contractSigned && (
                      <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Awaiting
                      </Button>
                    )}
                    {contract.contractSigned && (
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Contract
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Send Contract Dialog */}
        <Dialog open={sendingDialogOpen} onOpenChange={setSendingDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Contract</DialogTitle>
              <DialogDescription>
                Send the employment contract to the worker for signature.
              </DialogDescription>
            </DialogHeader>

            {selectedContract && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedContract.workerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContract.workerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedContract.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContract.jobLocation}, {selectedContract.jobCountry}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Contract Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Workers will receive reminders as the expiry date approaches.
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  The worker will receive a notification and will be able to review and sign the
                  contract from their dashboard.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSendingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendContract} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Contract
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
