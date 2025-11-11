import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";

export default function ManageJobs() {
  const jobs = [
    { id: 1, title: "Senior Welder", location: "Dubai, UAE", applications: 15, status: "Active", posted: "2024-01-10" },
    { id: 2, title: "Electrician", location: "Qatar", applications: 8, status: "Active", posted: "2024-01-12" },
    { id: 3, title: "Construction Worker", location: "Saudi Arabia", applications: 22, status: "Closed", posted: "2024-01-05" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <Button onClick={() => window.location.href = "/employer/post-job"}>Post New Job</Button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{job.location}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{job.applications} applications</span>
                    <span>•</span>
                    <span>Posted on {job.posted}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
