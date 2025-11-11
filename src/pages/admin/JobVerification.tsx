import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Eye } from "lucide-react";
import { toast } from "sonner";

export default function JobVerification() {
  const jobs = [
    { id: 1, title: "Senior Welder", company: "ShreeFab Industries", status: "Pending", posted: "2024-01-15" },
    { id: 2, title: "Electrician", company: "NorthWorks Pvt Ltd", status: "Pending", posted: "2024-01-14" },
    { id: 3, title: "Construction Worker", company: "BuildCo", status: "Verified", posted: "2024-01-10" },
  ];

  const handleApprove = () => {
    toast.success("Job approved successfully!");
  };

  const handleReject = () => {
    toast.error("Job rejected");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Job Verification</h1>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <Badge variant={job.status === "Pending" ? "secondary" : "default"}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{job.company}</p>
                  <p className="text-sm text-muted-foreground">Posted on {job.posted}</p>
                </div>
                {job.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="icon" onClick={handleApprove}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleReject}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
