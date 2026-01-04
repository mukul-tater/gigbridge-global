import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Send, Download, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

export default function Insurance() {
  const insurancePolicy = {
    policyNumber: "INS-2024-56789",
    provider: "Gulf Insurance Group",
    coverageAmount: "100,000 USD",
    startDate: "2024-02-01",
    expiryDate: "2026-02-01",
    status: "LIVE",
  };

  const remittances = [
    {
      id: 1,
      amount: 1500,
      currency: "USD",
      recipient: "Rajesh Kumar",
      account: "****5678",
      status: "COMPLETED",
      date: "2024-01-15",
      transactionId: "TXN123456789",
    },
    {
      id: 2,
      amount: 1200,
      currency: "USD",
      recipient: "Rajesh Kumar",
      account: "****5678",
      status: "PROCESSING",
      date: "2024-01-28",
      transactionId: "TXN123456790",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-primary">Processing</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSendMoney = () => {
    toast.success("Remittance initiated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col">
        <WorkerHeader />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
          <PortalBreadcrumb />
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Insurance & Remittance</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your insurance policy and send money home</p>
          </div>

        <Tabs defaultValue="insurance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="remittance">Remittance</TabsTrigger>
          </TabsList>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Health Insurance Policy</h2>
                      <p className="text-sm text-muted-foreground">{insurancePolicy.provider}</p>
                    </div>
                    {getStatusBadge(insurancePolicy.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Policy Number</p>
                      <p className="font-medium">{insurancePolicy.policyNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage Amount</p>
                      <p className="font-medium">{insurancePolicy.coverageAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{insurancePolicy.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{insurancePolicy.expiryDate}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Policy Active</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your health insurance is active and provides comprehensive coverage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Policy
                    </Button>
                    <Button variant="outline">View Coverage Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Remittance Tab */}
          <TabsContent value="remittance" className="space-y-6">
            {/* Send Money Form */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Send Money Home</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient Name</label>
                  <Input placeholder="Enter recipient name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account Number</label>
                  <Input placeholder="Enter account number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">IFSC Code</label>
                  <Input placeholder="Enter IFSC code" />
                </div>
                <Button onClick={handleSendMoney} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <div className="space-y-4">
                {remittances.map((remittance) => (
                  <div
                    key={remittance.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {remittance.amount} {remittance.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {remittance.recipient} ({remittance.account})
                        </p>
                        <p className="text-sm text-muted-foreground">{remittance.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(remittance.status)}
                      {remittance.transactionId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {remittance.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}
