import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, DollarSign, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function EscrowPayments() {
  const escrowBalance = 25000;
  
  const transactions = [
    {
      id: 1,
      worker: "Amit Kumar",
      contract: "Senior Welder - 24 months",
      amount: 3000,
      status: "HELD",
      createdAt: "2024-02-01",
      description: "Monthly salary - February 2024",
    },
    {
      id: 2,
      worker: "Priya Sharma",
      contract: "Electrician - 18 months",
      amount: 2800,
      status: "RELEASED",
      createdAt: "2024-01-15",
      releasedAt: "2024-01-31",
      description: "Monthly salary - January 2024",
    },
    {
      id: 3,
      worker: "Rajesh Singh",
      contract: "Construction Worker - 12 months",
      amount: 2500,
      status: "PENDING",
      createdAt: "2024-02-05",
      description: "Contract signing bonus",
    },
  ];

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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAddFunds = () => {
    toast.success("Funds added to escrow account");
  };

  const handleRelease = (worker: string, amount: number) => {
    toast.success(`Released $${amount} to ${worker}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Escrow & Payment System</h1>
          <p className="text-muted-foreground">Secure salary payments through escrow</p>
        </div>

        {/* Escrow Balance */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escrow Balance</p>
                <p className="text-3xl font-bold">${escrowBalance.toLocaleString()} USD</p>
              </div>
            </div>
            <Button onClick={handleAddFunds}>
              <DollarSign className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Secure Escrow Protection</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Funds are held securely and released only when contract milestones are met or payments are due.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="held">Held in Escrow</TabsTrigger>
            <TabsTrigger value="released">Released</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{transaction.worker}</h3>
                        <p className="text-sm text-muted-foreground">{transaction.contract}</p>
                        <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${transaction.amount} USD</p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Created: {transaction.createdAt}</span>
                      </div>
                      {transaction.releasedAt && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Released: {transaction.releasedAt}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {transaction.status === "HELD" && (
                      <div className="flex gap-3 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleRelease(transaction.worker, transaction.amount)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Release Payment
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="held" className="space-y-4">
            {transactions
              .filter((t) => t.status === "HELD")
              .map((transaction) => (
                <Card key={transaction.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{transaction.worker}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${transaction.amount} USD</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => handleRelease(transaction.worker, transaction.amount)}
                      >
                        Release Payment
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="released" className="space-y-4">
            {transactions
              .filter((t) => t.status === "RELEASED")
              .map((transaction) => (
                <Card key={transaction.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{transaction.worker}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">Released on {transaction.releasedAt}</p>
                    </div>
                    <p className="text-xl font-bold">${transaction.amount} USD</p>
                  </div>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* How Escrow Works */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">How Escrow Works</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Deposit Funds</p>
                <p className="text-muted-foreground">Add funds to your escrow account securely</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Funds Held Securely</p>
                <p className="text-muted-foreground">Money is held in escrow until contract terms are met</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Release Payment</p>
                <p className="text-muted-foreground">Release funds to workers when milestones are completed</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
      </div>
    </div>
  );
}
