import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

export default function EmployerPayments() {
  const payments = [
    { id: 1, worker: "Amit Kumar", amount: "$3,200", date: "2024-01-15", status: "Completed" },
    { id: 2, worker: "Priya Patel", amount: "$2,800", date: "2024-01-10", status: "Pending" },
    { id: 3, worker: "Vikram Singh", amount: "$4,100", date: "2024-01-05", status: "Completed" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Payments</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">$10,100</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">$2,800</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Payment History</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium mb-1">{payment.worker}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{payment.amount}</span>
                  <Badge variant={payment.status === "Completed" ? "default" : "secondary"}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
      </div>
    </div>
  );
}
