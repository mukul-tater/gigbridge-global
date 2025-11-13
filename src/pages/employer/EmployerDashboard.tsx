import { useAuth } from "@/contexts/AuthContext";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, AlertCircle, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BackgroundVerificationCard from "@/components/employer/BackgroundVerificationCard";
import PaymentManagementCard from "@/components/employer/PaymentManagementCard";
import AnalyticsSummaryCard from "@/components/employer/AnalyticsSummaryCard";

export default function EmployerDashboard() {
  const { profile } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile?.id]);

  const fetchDashboardData = async () => {
    try {
      const [verificationsRes, paymentsRes, jobsRes, applicationsRes] = await Promise.all([
        supabase.from('background_verifications').select('*').eq('employer_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('employer_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').eq('employer_id', profile?.id),
        supabase.from('job_applications').select('*').eq('employer_id', profile?.id)
      ]);

      setVerifications(verificationsRes.data || []);
      setPayments(paymentsRes.data || []);
      setJobs(jobsRes.data || []);
      setApplications(applicationsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsData = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j: any) => j.status === 'ACTIVE').length,
    totalApplications: applications.length,
    totalViews: jobs.reduce((sum: number, job: any) => sum + (job.views || 0), 0),
    shortlistedCandidates: applications.filter((a: any) => a.status === 'SHORTLISTED').length,
    hiredCandidates: applications.filter((a: any) => a.status === 'HIRED').length,
    avgTimeToHire: 28,
    conversionRate: applications.length > 0 ? ((applications.filter((a: any) => a.status === 'HIRED').length / applications.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <EmployerSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Mock data for analytics
  const hiringMetricsData = [
    { month: "Jan", applications: 45, shortlisted: 12, hired: 3 },
    { month: "Feb", applications: 52, shortlisted: 15, hired: 5 },
    { month: "Mar", applications: 48, shortlisted: 14, hired: 4 },
    { month: "Apr", applications: 61, shortlisted: 18, hired: 6 },
    { month: "May", applications: 55, shortlisted: 16, hired: 5 },
    { month: "Jun", applications: 67, shortlisted: 20, hired: 7 },
  ];

  const timeToHireData = [
    { position: "Welder", days: 28 },
    { position: "Electrician", days: 35 },
    { position: "Plumber", days: 22 },
    { position: "Mason", days: 31 },
    { position: "Carpenter", days: 26 },
  ];

  const pipelineData = [
    { stage: "Applied", count: 234, color: "hsl(var(--primary))" },
    { stage: "Shortlisted", count: 45, color: "hsl(var(--chart-2))" },
    { stage: "Interview", count: 28, color: "hsl(var(--chart-3))" },
    { stage: "Offered", count: 12, color: "hsl(var(--chart-4))" },
    { stage: "Hired", count: 8, color: "hsl(var(--chart-5))" },
  ];

  const complianceData = [
    { status: "Compliant", value: 75, color: "hsl(var(--chart-5))" },
    { status: "Pending", value: 18, color: "hsl(var(--chart-3))" },
    { status: "Non-Compliant", value: 7, color: "hsl(var(--destructive))" },
  ];

  return (
    <div className="flex min-h-screen bg-background w-full">
      <EmployerSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Employer'}!</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your job postings and find talent</p>
        </div>

        <AnalyticsSummaryCard data={analyticsData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 my-6 md:my-8">
          <BackgroundVerificationCard 
            verifications={verifications} 
            onRefresh={fetchDashboardData}
          />
          <PaymentManagementCard payments={payments} />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Hiring Metrics Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hiring Metrics (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hiringMetricsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} name="Applications" />
                <Line type="monotone" dataKey="shortlisted" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Shortlisted" />
                <Line type="monotone" dataKey="hired" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Hired" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Time to Hire Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Average Time to Hire (Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeToHireData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="position" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="days" fill="hsl(var(--chart-3))" name="Days" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Average: 28 days</p>
                <p className="text-xs text-muted-foreground">Industry benchmark: 32 days</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Candidate Pipeline */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Candidate Pipeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="stage" type="category" className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" name="Candidates">
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Compliance Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Compliance Status</h2>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {complianceData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm font-medium">{item.status}</p>
                      <p className="text-xs text-muted-foreground">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Compliant</p>
                <p className="text-sm font-bold">75</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-bold">18</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Issues</p>
                <p className="text-sm font-bold">7</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
