import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, DollarSign, ArrowRight, Clock, CheckCircle, Plus, Percent, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

interface EscrowPayment {
  id: string;
  worker_id: string;
  job_id: string | null;
  gross_amount: number;
  platform_fee: number;
  platform_fee_percentage: number;
  net_amount: number;
  currency: string;
  escrow_status: string;
  description: string | null;
  created_at: string;
  released_at: string | null;
  worker_name?: string;
  job_title?: string;
}

interface Worker {
  id: string;
  full_name: string;
}

interface Job {
  id: string;
  title: string;
}

const PLATFORM_FEE_PERCENTAGE = 1;

export default function EscrowPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<EscrowPayment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  const platformFee = grossAmount ? (parseFloat(grossAmount) * PLATFORM_FEE_PERCENTAGE) / 100 : 0;
  const netAmount = grossAmount ? parseFloat(grossAmount) - platformFee : 0;

  useEffect(() => {
    if (user) {
      fetchPayments();
      fetchWorkersAndJobs();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select("*")
        .eq("employer_id", user?.id)
        .eq("payment_type", "escrow")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch worker names and job titles
      const enrichedPayments = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          let workerName = "Unknown Worker";
          let jobTitle = "";

          if (payment.worker_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payment.worker_id)
              .single();
            if (profile) workerName = profile.full_name || "Unknown Worker";
          }

          if (payment.job_id) {
            const { data: job } = await supabase
              .from("jobs")
              .select("title")
              .eq("id", payment.job_id)
              .single();
            if (job) jobTitle = job.title;
          }

          return {
            ...payment,
            worker_name: workerName,
            job_title: jobTitle,
          };
        })
      );

      setPayments(enrichedPayments);
    } catch (error: any) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkersAndJobs = async () => {
    try {
      // Fetch workers from job applications
      const { data: applications } = await supabase
        .from("job_applications")
        .select("worker_id")
        .eq("employer_id", user?.id)
        .eq("status", "ACCEPTED");

      if (applications && applications.length > 0) {
        const workerIds = [...new Set(applications.map((a) => a.worker_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", workerIds);
        
        if (profiles) {
          setWorkers(profiles.map((p) => ({ id: p.id, full_name: p.full_name || "Unknown" })));
        }
      }

      // Fetch employer's jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user?.id);

      if (jobsData) {
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Failed to fetch workers and jobs:", error);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedWorker || !grossAmount || parseFloat(grossAmount) <= 0) {
      toast.error("Please select a worker and enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("payments").insert({
        employer_id: user?.id,
        worker_id: selectedWorker,
        job_id: selectedJob || null,
        payment_type: "escrow",
        gross_amount: parseFloat(grossAmount),
        platform_fee: platformFee,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
        net_amount: netAmount,
        amount: netAmount, // Legacy field - net amount worker receives
        currency,
        description: description || `Escrow payment - ${format(new Date(), "MMMM yyyy")}`,
        status: "pending",
        escrow_status: "HELD",
      });

      if (error) throw error;

      toast.success("Payment created and held in escrow");
      setIsDialogOpen(false);
      resetForm();
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to create payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleasePayment = async (paymentId: string, workerName: string, amount: number) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          escrow_status: "RELEASED",
          status: "completed",
          released_at: new Date().toISOString(),
          released_by: user?.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast.success(`Released $${amount.toFixed(2)} to ${workerName}`);
      fetchPayments();
    } catch (error: any) {
      toast.error("Failed to release payment");
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          escrow_status: "REFUNDED",
          status: "refunded",
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast.success("Payment refunded");
      fetchPayments();
    } catch (error: any) {
      toast.error("Failed to refund payment");
    }
  };

  const resetForm = () => {
    setSelectedWorker("");
    setSelectedJob("");
    setGrossAmount("");
    setCurrency("USD");
    setDescription("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HELD":
        return <Badge className="bg-primary">Held in Escrow</Badge>;
      case "RELEASED":
        return <Badge className="bg-green-500">Released</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "REFUNDED":
        return <Badge variant="secondary">Refunded</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const escrowBalance = payments
    .filter((p) => p.escrow_status === "HELD")
    .reduce((sum, p) => sum + (p.net_amount || 0), 0);

  const totalFees = payments
    .filter((p) => p.escrow_status === "RELEASED")
    .reduce((sum, p) => sum + (p.platform_fee || 0), 0);

  const formatCurrency = (amount: number, curr: string = "USD") => {
    const symbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
      SAR: "﷼",
      QAR: "ر.ق",
    };
    return `${symbols[curr] || curr}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <EmployerHeader />
        <div className="flex flex-1">
          <EmployerSidebar />
          <main className="flex-1 p-4 md:p-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
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
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <PortalBreadcrumb />
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Escrow & Payment System</h1>
            <p className="text-muted-foreground">Secure salary payments with 1% platform fee</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Held in Escrow</p>
                  <p className="text-2xl font-bold">{formatCurrency(escrowBalance)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Released</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      payments
                        .filter((p) => p.escrow_status === "RELEASED")
                        .reduce((sum, p) => sum + (p.net_amount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/10 p-3 rounded-lg">
                  <Percent className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fees (1%)</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalFees)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Payment Button */}
          <div className="flex justify-end mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Escrow Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Escrow Payment</DialogTitle>
                  <DialogDescription>
                    Create a new payment to be held in escrow. A 1% platform fee will be deducted from the worker's salary.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Worker *</Label>
                    <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {workers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No workers with accepted applications found.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Related Job (Optional)</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gross Amount *</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={grossAmount}
                        onChange={(e) => setGrossAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="AED">AED (د.إ)</SelectItem>
                          <SelectItem value="SAR">SAR (﷼)</SelectItem>
                          <SelectItem value="QAR">QAR (ر.ق)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {grossAmount && parseFloat(grossAmount) > 0 && (
                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-medium mb-3">Payment Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Gross Amount:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(grossAmount), currency)}</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                          <span>Platform Fee (1%):</span>
                          <span>-{formatCurrency(platformFee, currency)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Worker Receives:</span>
                          <span className="text-green-600">{formatCurrency(netAmount, currency)}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="e.g., Monthly salary - January 2024"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePayment} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create & Hold in Escrow
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Platform Fee Info */}
          <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">1% Platform Fee</p>
                <p className="text-sm text-muted-foreground">
                  A 1% platform fee is deducted from each payment when released to the worker. This fee helps maintain the platform and provide secure escrow services.
                </p>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
              <TabsTrigger value="held">
                Held ({payments.filter((p) => p.escrow_status === "HELD").length})
              </TabsTrigger>
              <TabsTrigger value="released">
                Released ({payments.filter((p) => p.escrow_status === "RELEASED").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {payments.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Escrow Payments Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first escrow payment to securely pay your workers
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Escrow Payment
                  </Button>
                </Card>
              ) : (
                payments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onRelease={handleReleasePayment}
                    onRefund={handleRefundPayment}
                    getStatusBadge={getStatusBadge}
                    formatCurrency={formatCurrency}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="held" className="space-y-4">
              {payments.filter((p) => p.escrow_status === "HELD").length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No payments currently held in escrow</p>
                </Card>
              ) : (
                payments
                  .filter((p) => p.escrow_status === "HELD")
                  .map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      onRelease={handleReleasePayment}
                      onRefund={handleRefundPayment}
                      getStatusBadge={getStatusBadge}
                      formatCurrency={formatCurrency}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="released" className="space-y-4">
              {payments.filter((p) => p.escrow_status === "RELEASED").length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No released payments yet</p>
                </Card>
              ) : (
                payments
                  .filter((p) => p.escrow_status === "RELEASED")
                  .map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      onRelease={handleReleasePayment}
                      onRefund={handleRefundPayment}
                      getStatusBadge={getStatusBadge}
                      formatCurrency={formatCurrency}
                    />
                  ))
              )}
            </TabsContent>
          </Tabs>

          {/* How Escrow Works */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">How Escrow Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded min-w-[32px] text-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Create Payment</p>
                  <p className="text-sm text-muted-foreground">
                    Enter the gross salary amount. The system calculates the 1% platform fee automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded min-w-[32px] text-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Held in Escrow</p>
                  <p className="text-sm text-muted-foreground">
                    Funds are held securely until you're ready to release them to the worker.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded min-w-[32px] text-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Release to Worker</p>
                  <p className="text-sm text-muted-foreground">
                    When ready, release the payment. Worker receives the net amount (minus 1% fee).
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

interface PaymentCardProps {
  payment: EscrowPayment;
  onRelease: (id: string, workerName: string, amount: number) => void;
  onRefund: (id: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatCurrency: (amount: number, currency?: string) => string;
}

function PaymentCard({ payment, onRelease, onRefund, getStatusBadge, formatCurrency }: PaymentCardProps) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-lg hidden md:block">
          <ArrowRight className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-lg">{payment.worker_name}</h3>
              {payment.job_title && (
                <p className="text-sm text-muted-foreground">{payment.job_title}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{payment.description}</p>
            </div>
            <div className="text-left sm:text-right">
              {getStatusBadge(payment.escrow_status)}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Gross</p>
                <p className="font-medium">{formatCurrency(payment.gross_amount || 0, payment.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fee (1%)</p>
                <p className="font-medium text-destructive">-{formatCurrency(payment.platform_fee || 0, payment.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net</p>
                <p className="font-medium text-green-600">{formatCurrency(payment.net_amount || 0, payment.currency)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Created: {format(new Date(payment.created_at), "MMM d, yyyy")}</span>
            </div>
            {payment.released_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Released: {format(new Date(payment.released_at), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>

          {payment.escrow_status === "HELD" && (
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                size="sm"
                onClick={() => onRelease(payment.id, payment.worker_name || "Worker", payment.net_amount || 0)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Release Payment
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRefund(payment.id)}>
                Refund
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}