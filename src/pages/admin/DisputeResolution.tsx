import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export default function DisputeResolution() {
  const disputes = [
    { id: 1, title: "Payment Dispute", parties: "Worker vs Employer", status: "Open", date: "2024-01-15" },
    { id: 2, title: "Contract Violation", parties: "Employer vs Worker", status: "In Progress", date: "2024-01-12" },
    { id: 3, title: "Job Description Mismatch", parties: "Worker vs Employer", status: "Resolved", date: "2024-01-10" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dispute Resolution</h1>

        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{dispute.title}</h3>
                    <Badge variant={
                      dispute.status === "Open" ? "destructive" : 
                      dispute.status === "In Progress" ? "secondary" : 
                      "default"
                    }>
                      {dispute.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{dispute.parties}</p>
                  <p className="text-sm text-muted-foreground">Filed on {dispute.date}</p>
                </div>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
