import { useAuth } from "@/contexts/AuthContext";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, Eye, TrendingUp } from "lucide-react";

export default function EmployerDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your job postings and find talent</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">8</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">45</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">234</span>
            </div>
            <p className="text-sm text-muted-foreground">Job Views</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">12</span>
            </div>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="bg-primary/10 p-2 rounded">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Amit Kumar applied for Senior Welder</p>
                    <p className="text-sm text-muted-foreground">5 years experience • 2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Performing Jobs</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Senior Welder</h3>
                  <p className="text-sm text-muted-foreground mb-2">15 applications • 89 views</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
