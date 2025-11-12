import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, CheckCircle, Clock, Download } from "lucide-react";
import { toast } from "sonner";

export default function Training() {
  const trainings = [
    {
      id: 1,
      name: "Pre-Departure Orientation Training (PDOT)",
      description: "Mandatory orientation for workers traveling abroad",
      status: "COMPLETED",
      progress: 100,
      startDate: "2024-01-05",
      completedDate: "2024-01-08",
      certificateUrl: "#",
    },
    {
      id: 2,
      name: "Safety & Health Training",
      description: "Workplace safety and health regulations",
      status: "IN_PROGRESS",
      progress: 65,
      startDate: "2024-01-15",
      completedDate: null,
      certificateUrl: null,
    },
    {
      id: 3,
      name: "Cultural Sensitivity Training",
      description: "Understanding local customs and workplace culture",
      status: "NOT_STARTED",
      progress: 0,
      startDate: null,
      completedDate: null,
      certificateUrl: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-primary">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const handleEnroll = (trainingName: string) => {
    toast.success(`Enrolled in ${trainingName}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Training & Pre-Departure Orientation</h1>
          <p className="text-muted-foreground">Complete required training programs before departure</p>
        </div>

        <div className="grid gap-6">
          {trainings.map((training) => (
            <Card key={training.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{training.name}</h3>
                      <p className="text-sm text-muted-foreground">{training.description}</p>
                    </div>
                    {getStatusBadge(training.status)}
                  </div>

                  {training.status !== "NOT_STARTED" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{training.progress}%</span>
                      </div>
                      <Progress value={training.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    {training.startDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Started: {training.startDate}</span>
                      </div>
                    )}
                    {training.completedDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Completed: {training.completedDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {training.status === "NOT_STARTED" && (
                      <Button onClick={() => handleEnroll(training.name)}>
                        Enroll Now
                      </Button>
                    )}
                    {training.status === "IN_PROGRESS" && (
                      <Button>Continue Training</Button>
                    )}
                    {training.status === "COMPLETED" && training.certificateUrl && (
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
