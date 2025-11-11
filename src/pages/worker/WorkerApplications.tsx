import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function WorkerApplications() {
  const applications = [
    { id: 1, job: "Senior Welder", company: "ShreeFab Industries", status: "Under Review", date: "2024-01-15" },
    { id: 2, job: "Electrician", company: "NorthWorks Pvt Ltd", status: "Interview Scheduled", date: "2024-01-14" },
    { id: 3, job: "Construction Worker", company: "BuildCo", status: "Rejected", date: "2024-01-10" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review": return "default";
      case "Interview Scheduled": return "secondary";
      case "Rejected": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{app.job}</h3>
                  <p className="text-muted-foreground mb-2">{app.company}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                    <span className="text-sm text-muted-foreground">Applied on {app.date}</span>
                  </div>
                </div>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
