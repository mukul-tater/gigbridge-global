import { useAuth } from "@/contexts/AuthContext";
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Briefcase, FileText, MessageSquare, TrendingUp } from "lucide-react";

export default function WorkerDashboard() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Worker'}!</h1>
          <p className="text-muted-foreground">Here's an overview of your activity</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">12</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Applications</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">5</span>
            </div>
            <p className="text-sm text-muted-foreground">New Messages</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">89%</span>
            </div>
            <p className="text-sm text-muted-foreground">Profile Completion</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Applied to Welder Position</p>
                  <p className="text-sm text-muted-foreground">ShreeFab Industries • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New message from NorthWorks</p>
                  <p className="text-sm text-muted-foreground">Interview invitation • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile viewed by employer</p>
                  <p className="text-sm text-muted-foreground">Construction Ltd • 1 day ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recommended Jobs</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Senior Welder</h3>
                <p className="text-sm text-muted-foreground mb-2">Dubai, UAE • $25-30/hr</p>
                <p className="text-sm">5+ years experience required</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Electrician</h3>
                <p className="text-sm text-muted-foreground mb-2">Qatar • $22-28/hr</p>
                <p className="text-sm">Industrial experience preferred</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Construction Supervisor</h3>
                <p className="text-sm text-muted-foreground mb-2">Saudi Arabia • $30-35/hr</p>
                <p className="text-sm">Leadership experience required</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
