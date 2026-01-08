import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import WorkerHeader from "@/components/worker/WorkerHeader";
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, CheckCircle, TrendingUp, ArrowDownCircle, Shield } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  gross_amount: number | null;
  platform_fee: number | null;
  platform_fee_percentage: number | null;
  net_amount: number | null;
  amount: number;
  currency: string;
  escrow_status: string | null;
  status: string;
  payment_type: string;
  description: string | null;
  created_at: string | null;
  released_at: string | null;
  job_id: string | null;
}

export default function WorkerPayments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["worker-payments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (escrowStatus: string | null, status: string) => {
    const displayStatus = escrowStatus || status;
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      HELD: { variant: "outline", label: "In Escrow" },
      RELEASED: { variant: "default", label: "Released" },
      REFUNDED: { variant: "destructive", label: "Refunded" },
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
    };
    const config = variants[displayStatus] || { variant: "secondary", label: displayStatus };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredPayments = payments.filter((payment) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return payment.escrow_status === "PENDING" || payment.escrow_status === "HELD";
    if (activeTab === "released") return payment.escrow_status === "RELEASED";
    if (activeTab === "refunded") return payment.escrow_status === "REFUNDED";
    return true;
  });

  // Calculate statistics
  const totalReceived = payments
    .filter((p) => p.escrow_status === "RELEASED")
    .reduce((sum, p) => sum + (p.net_amount || p.amount), 0);

  const pendingAmount = payments
    .filter((p) => p.escrow_status === "HELD" || p.escrow_status === "PENDING")
    .reduce((sum, p) => sum + (p.net_amount || p.amount), 0);

  const totalFeesPaid = payments
    .filter((p) => p.escrow_status === "RELEASED")
    .reduce((sum, p) => sum + (p.platform_fee || 0), 0);

  const totalPayments = payments.filter((p) => p.escrow_status === "RELEASED").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <WorkerSidebar />
        <SidebarInset className="flex-1">
          <WorkerHeader />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
                <p className="text-muted-foreground mt-1">
                  View your payment history and escrow details
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalReceived.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {totalPayments} payments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      ${pendingAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In escrow
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${totalFeesPaid.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1% service fee
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{payments.length}</div>
                    <p className="text-xs text-muted-foreground">
                      All time
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    How Escrow Protects You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Employer Funds</p>
                        <p className="text-sm text-muted-foreground">Employer deposits payment into escrow</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Work Completed</p>
                        <p className="text-sm text-muted-foreground">You complete your assigned work</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Release Approved</p>
                        <p className="text-sm text-muted-foreground">Employer approves the release</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium">You Get Paid</p>
                        <p className="text-sm text-muted-foreground">Funds released to you (1% fee)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Your escrow payments and fee breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="released">Released</TabsTrigger>
                      <TabsTrigger value="refunded">Refunded</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ArrowDownCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No payments found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredPayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(payment.escrow_status, payment.status)}
                                    <span className="text-sm text-muted-foreground">
                                      {payment.created_at && format(new Date(payment.created_at), "MMM d, yyyy")}
                                    </span>
                                  </div>
                                  <p className="font-medium">
                                    {payment.description || payment.payment_type}
                                  </p>
                                  {payment.released_at && (
                                    <p className="text-sm text-muted-foreground">
                                      Released: {format(new Date(payment.released_at), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                  )}
                                </div>

                                <div className="lg:text-right space-y-1">
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Gross</p>
                                      <p className="font-medium">
                                        {payment.currency} {(payment.gross_amount || payment.amount).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Fee ({payment.platform_fee_percentage || 1}%)</p>
                                      <p className="font-medium text-destructive">
                                        -{payment.currency} {(payment.platform_fee || 0).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">You Receive</p>
                                      <p className="font-bold text-green-600">
                                        {payment.currency} {(payment.net_amount || payment.amount).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
