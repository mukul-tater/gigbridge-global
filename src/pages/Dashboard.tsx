import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, UserCircle, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'worker' | 'employer' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if user has a profile
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (workerProfile) {
        setUserType('worker');
      } else if (employerProfile) {
        setUserType('employer');
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileSelection = (type: 'worker' | 'employer') => {
    setUserType(type);
    if (type === 'worker') {
      navigate('/onboarding');
    } else {
      navigate('/profile/employer');
    }
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
                Welcome, {user.email}
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your global gig work opportunities
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {!userType ? (
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Choose Your Profile Type</CardTitle>
                  <CardDescription>
                    Select whether you're looking for work opportunities or seeking to hire skilled workers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleProfileSelection('worker')}>
                      <CardHeader className="text-center">
                        <UserCircle className="h-16 w-16 mx-auto text-primary mb-4" />
                        <CardTitle>I'm a Worker</CardTitle>
                        <CardDescription>
                          Find international job opportunities in construction, electrical, plumbing, welding, and more
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <User className="mr-2 h-4 w-4" />
                          Create Worker Profile
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleProfileSelection('employer')}>
                      <CardHeader className="text-center">
                        <Building2 className="h-16 w-16 mx-auto text-primary mb-4" />
                        <CardTitle>I'm an Employer</CardTitle>
                        <CardDescription>
                          Hire skilled workers from India and other countries for your projects and operations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Building2 className="mr-2 h-4 w-4" />
                          Create Employer Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="jobs">
                    {userType === 'worker' ? 'Find Jobs' : 'My Jobs'}
                  </TabsTrigger>
                  <TabsTrigger value="applications">
                    {userType === 'worker' ? 'My Applications' : 'Applications'}
                  </TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Complete your profile to access all features
                        </p>
                        <Button className="mt-4" onClick={() => navigate(userType === 'worker' ? '/onboarding' : `/profile/${userType}`)}>
                          {userType === 'worker' ? 'Complete Worker Onboarding' : 'Complete Employer Profile'}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {userType === 'worker' ? 'Available Jobs' : 'Posted Jobs'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">
                          {userType === 'worker' ? 'Matching your skills' : 'Currently active'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {userType === 'worker' ? 'Applications' : 'Candidates'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">
                          {userType === 'worker' ? 'Submitted applications' : 'Total applicants'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="jobs" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {userType === 'worker' ? 'Find Jobs' : 'Manage Job Postings'}
                      </CardTitle>
                      <CardDescription>
                        {userType === 'worker' 
                          ? 'Browse international opportunities matching your skills'
                          : 'Create and manage your job postings'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {userType === 'worker' 
                          ? 'Complete your profile to see personalized job recommendations'
                          : 'Post your first job to start finding qualified candidates'
                        }
                      </p>
                      <Button className="mt-4">
                        {userType === 'worker' ? 'Browse Jobs' : 'Post a Job'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="applications" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {userType === 'worker' ? 'My Applications' : 'Job Applications'}
                      </CardTitle>
                      <CardDescription>
                        {userType === 'worker' 
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
                      <CardTitle>Messages</CardTitle>
                      <CardDescription>
                        Communicate with {userType === 'worker' ? 'employers' : 'candidates'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">No messages yet</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;