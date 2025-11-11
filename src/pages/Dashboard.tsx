import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, UserCircle, Building2, Briefcase, FileText, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {user.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                Role: {user.role}
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">
                  {user.role === 'WORKER' ? 'Find Jobs' : 'My Jobs'}
                </TabsTrigger>
                <TabsTrigger value="applications">
                  {user.role === 'WORKER' ? 'My Applications' : 'Applications'}
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        Profile Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {user.role === 'WORKER' ? 'Worker Profile Active' : 
                         user.role === 'EMPLOYER' ? 'Employer Profile Active' : 
                         'Admin Dashboard'}
                      </p>
                      <Button className="mt-4 w-full" variant="outline">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {user.role === 'WORKER' ? 'Available Jobs' : 'Posted Jobs'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {user.role === 'WORKER' ? 'Matching your skills' : 'Currently active'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {user.role === 'WORKER' ? 'Applications' : 'Candidates'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {user.role === 'WORKER' ? 'Submitted' : 'Total applicants'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {user.role === 'ADMIN' && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Admin Actions</CardTitle>
                      <CardDescription>Manage platform users and data</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                      <Button variant="outline">Manage Users</Button>
                      <Button variant="outline">Verify Workers</Button>
                      <Button variant="outline">Reset Demo</Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="jobs" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {user.role === 'WORKER' ? 'Find Jobs' : 'Manage Job Postings'}
                    </CardTitle>
                    <CardDescription>
                      {user.role === 'WORKER' 
                        ? 'Browse international opportunities matching your skills'
                        : 'Create and manage your job postings'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Coming soon - Job listings will appear here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {user.role === 'WORKER' ? 'My Applications' : 'Job Applications'}
                    </CardTitle>
                    <CardDescription>
                      {user.role === 'WORKER' 
                        ? 'Track your job applications and their status'
                        : 'Review and manage candidate applications'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No applications yet</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messages
                    </CardTitle>
                    <CardDescription>
                      Communicate with {user.role === 'WORKER' ? 'employers' : 'candidates'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No messages yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
