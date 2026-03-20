import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InteractiveChart from "@/components/InteractiveChart";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, AlertCircle, LayoutDashboard, User, Building2, PlusCircle, Briefcase, Users, MessageSquare, Calendar, FileSignature, Shield, FileCheck, Bookmark, Star, UserCheck, History, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BackgroundVerificationCard from "@/components/employer/BackgroundVerificationCard";
import PaymentManagementCard from "@/components/employer/PaymentManagementCard";
import AnalyticsSummaryCard from "@/components/employer/AnalyticsSummaryCard";
import ShortlistedCandidatesCard from "@/components/employer/ShortlistedCandidatesCard";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

const employerNavItems = [
  { path: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/employer/profile", icon: User, label: "My Profile" },
  { path: "/employer/company", icon: Building2, label: "Company Profile & KYC" },
  { path: "/employer/post-job", icon: PlusCircle, label: "Post a Job" },
  { path: "/employer/manage-jobs", icon: Briefcase, label: "Manage Jobs" },
  { path: "/employer/search-workers", icon: Users, label: "Search Workers" },
  { path: "/employer/saved-searches", icon: Bookmark, label: "Saved Searches" },
  { path: "/employer/applications", icon: UserCheck, label: "Applications" },
  { path: "/employer/shortlist", icon: Star, label: "Shortlist" },
  { path: "/employer/formalities", icon: FileCheck, label: "Post-Approval Formalities" },
  { path: "/employer/contracts", icon: FileSignature, label: "Contract Management" },
  { path: "/employer/contract-history", icon: History, label: "Contract History" },
  { path: "/employer/interviews", icon: Calendar, label: "Interview Scheduling" },
  { path: "/employer/offers", icon: FileSignature, label: "Offer Management" },
  { path: "/employer/escrow", icon: Shield, label: "Escrow & Payments" },
  { path: "/employer/compliance", icon: FileCheck, label: "Compliance Reports" },
  { path: "/employer/reports", icon: BarChart3, label: "Reports & Analytics" },
  { path: "/employer/messaging", icon: MessageSquare, label: "Messages" },
];

const employerProfileMenu = [
  { label: "My Account", icon: User, path: "/employer/profile" },
  { label: "Company Profile", icon: Building2, path: "/employer/company" },
];

export default function EmployerDashboard() {
  const { profile } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [shortlistedWorkers, setShortlistedWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchDashboardData();
  }, [profile?.id]);

  const fetchDashboardData = async () => {
    try {
      const [verificationsRes, paymentsRes, jobsRes, applicationsRes, shortlistRes] = await Promise.all([
        supabase.from('background_verifications').select('*').eq('employer_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('employer_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').eq('employer_id', profile?.id),
        supabase.from('job_applications').select('*').eq('employer_id', profile?.id),
        supabase.from('shortlisted_workers').select('*').eq('employer_id', profile?.id).order('created_at', { ascending: false }).limit(5)
      ]);

      setVerifications(verificationsRes.data || []);
      setPayments(paymentsRes.data || []);
      setJobs(jobsRes.data || []);
      setApplications(applicationsRes.data || []);

      if (shortlistRes.data && shortlistRes.data.length > 0) {
        const workerIds = shortlistRes.data.map(w => w.worker_id);
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email, avatar_url').in('id', workerIds);
        setShortlistedWorkers(shortlistRes.data.map(worker => ({
          ...worker,
          profiles: profilesData?.find(p => p.id === worker.worker_id) || { full_name: null, email: "", avatar_url: null }
        })));
      } else {
        setShortlistedWorkers([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHiringMetrics = () => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const metricsData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthApps = applications.filter((app: any) => {
        const appDate = new Date(app.applied_at);
        return appDate.getMonth() === targetMonth.getMonth() && appDate.getFullYear() === targetMonth.getFullYear();
      });
      metricsData.push({
        month: months[targetMonth.getMonth()],
        applications: monthApps.length,
        shortlisted: monthApps.filter((a: any) => a.status === 'SHORTLISTED').length,
        hired: monthApps.filter((a: any) => a.status === 'HIRED').length
      });
    }
    return metricsData;
  };

  const generatePipelineData = () => [
    { stage: "Applied", count: applications.filter((a: any) => a.status === 'PENDING').length, color: "hsl(var(--primary))" },
    { stage: "Shortlisted", count: applications.filter((a: any) => a.status === 'SHORTLISTED').length, color: "hsl(var(--chart-2))" },
    { stage: "Interview", count: applications.filter((a: any) => a.status === 'INTERVIEW').length, color: "hsl(var(--chart-3))" },
    { stage: "Offered", count: applications.filter((a: any) => a.status === 'OFFERED').length, color: "hsl(var(--chart-4))" },
    { stage: "Hired", count: applications.filter((a: any) => a.status === 'HIRED').length, color: "hsl(var(--chart-5))" },
  ];

  const getTopPerformingJobs = () => {
    const jobAppCounts: Record<string, { job: any; count: number }> = {};
    applications.forEach((app: any) => {
      if (!jobAppCounts[app.job_id]) {
        const job = jobs.find((j: any) => j.id === app.job_id);
        if (job) jobAppCounts[app.job_id] = { job, count: 0 };
      }
      if (jobAppCounts[app.job_id]) jobAppCounts[app.job_id].count++;
    });
    return Object.values(jobAppCounts).sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const hiringMetricsData = generateHiringMetrics();
  const pipelineData = generatePipelineData();
  const topPerformingJobs = getTopPerformingJobs();

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
      <DashboardLayout navItems={employerNavItems} portalLabel="Employer Portal" portalName="Employer Portal" profileMenuItems={employerProfileMenu}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const timeToHireData = jobs.slice(0, 5).map((job: any) => ({
    position: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
    days: Math.floor(Math.random() * 20) + 15
  }));

  const totalVerifications = verifications.length || 1;
  const compliantCount = verifications.filter((v: any) => v.status === 'completed' && v.result === 'passed').length;
  const pendingCount = verifications.filter((v: any) => v.status === 'pending').length;
  const failedCount = verifications.filter((v: any) => v.result === 'failed').length;

  const complianceData = [
    { status: "Compliant", value: totalVerifications > 0 ? Math.round((compliantCount / totalVerifications) * 100) : 0, color: "hsl(var(--chart-5))" },
    { status: "Pending", value: totalVerifications > 0 ? Math.round((pendingCount / totalVerifications) * 100) : 0, color: "hsl(var(--chart-3))" },
    { status: "Non-Compliant", value: totalVerifications > 0 ? Math.round((failedCount / totalVerifications) * 100) : 0, color: "hsl(var(--destructive))" },
  ];

  return (
    <DashboardLayout navItems={employerNavItems} portalLabel="Employer Portal" portalName="Employer Portal" profileMenuItems={employerProfileMenu}>
      <PortalBreadcrumb />
      <OnboardingStepper />

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Employer'}!</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your job postings and find talent</p>
      </div>

      <AnalyticsSummaryCard data={analyticsData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 my-6 md:my-8">
        <BackgroundVerificationCard verifications={verifications} onRefresh={fetchDashboardData} />
        <PaymentManagementCard payments={payments} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <Card className="p-6">
          <InteractiveChart
            title="Hiring Metrics"
            type="line"
            data={hiringMetricsData}
            dataKeys={[
              { key: 'applications', color: 'hsl(var(--primary))', name: 'Applications' },
              { key: 'shortlisted', color: 'hsl(var(--chart-2))', name: 'Shortlisted' },
              { key: 'hired', color: 'hsl(var(--success))', name: 'Hired' }
            ]}
          />
        </Card>
        <Card className="p-6">
          <InteractiveChart
            title="Time to Hire by Position"
            type="bar"
            data={timeToHireData.map(item => ({ month: item.position, days: item.days }))}
            dataKeys={[{ key: 'days', color: 'hsl(var(--chart-3))', name: 'Days to Hire' }]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Candidate Pipeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count" label>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Compliance Status</h2>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
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
              <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Compliant</p>
              <p className="text-sm font-bold">{compliantCount}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-bold">{pendingCount}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Issues</p>
              <p className="text-sm font-bold">{failedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ShortlistedCandidatesCard workers={shortlistedWorkers} loading={loading} />
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Jobs</h2>
          <div className="space-y-4">
            {topPerformingJobs.length > 0 ? (
              topPerformingJobs.map(({ job, count }) => (
                <div key={job.id} className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{count} applications • {job.location}</p>
                  <span className={`text-xs px-2 py-1 rounded ${job.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {job.status}
                  </span>
                </div>
              ))
            ) : jobs.length > 0 ? (
              jobs.slice(0, 3).map((job: any) => (
                <div key={job.id} className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">0 applications • {job.location}</p>
                  <span className={`text-xs px-2 py-1 rounded ${job.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No jobs posted yet</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
