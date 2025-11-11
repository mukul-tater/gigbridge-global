import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Ban, CheckCircle } from "lucide-react";

export default function UserManagement() {
  const users = [
    { id: 1, name: "Amit Kumar", email: "worker@demo.local", role: "Worker", status: "Active", joined: "2024-01-10" },
    { id: 2, name: "Rajesh Sharma", email: "emp@demo.local", role: "Employer", status: "Active", joined: "2024-01-08" },
    { id: 3, name: "Priya Patel", email: "priya@demo.local", role: "Worker", status: "Suspended", joined: "2024-01-05" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <Badge variant={user.role === "Worker" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Joined {user.joined}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.status === "Active" ? (
                    <Button variant="outline" size="icon">
                      <Ban className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
