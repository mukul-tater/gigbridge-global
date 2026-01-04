import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  Building2, 
  UserCheck, 
  FileText, 
  TrendingUp,
  DollarSign,
  Clock,
  Globe,
  Shield
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DisputeManagementCard from "@/components/admin/DisputeManagementCard";
import ContentModerationCard from "@/components/admin/ContentModerationCard";
import UserManagementCard from "@/components/admin/UserManagementCard";
import MessageMonitoringCard from "@/components/admin/MessageMonitoringCard";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboardSkeleton } from "@/components/ui/page-skeleton";

interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  totalAdmins: number;
  activeJobs: number;
  draftJobs: number;
  totalJobs: number;
  pendingApplications: number;
  approvedApplications: number;
  totalApplications: number;
  pendingVerifications: number;
  verifiedDocuments: number;
  totalOffers: number;
  acceptedOffers: number;
  pendingDisputes: number;
  resolvedDisputes: number;
  totalPayments: number;
  pendingPayments: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string;
}

interface RecentJob {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  company_name?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentSection, setCurrentSection] = useState(0);
  const [disputes, setDisputes] = useState([]);
  const [contentFlags, setContentFlags] = useState([]);
  const [moderationActions, setModerationActions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    totalAdmins: 0,
    activeJobs: 0,
    draftJobs: 0,
    totalJobs: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalApplications: 0,
    pendingVerifications: 0,
    verifiedDocuments: 0,
    totalOffers: 0,
    acceptedOffers: 0,
    pendingDisputes: 0,
    resolvedDisputes: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  const sections = ['overview', 'users', 'disputes', 'activity'];

  useSwipe({
    onSwipeLeft: () => {
      if (isMobile && currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        document.getElementById(`section-${sections[currentSection + 1]}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onSwipeRight: () => {
      if (isMobile && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
        document.getElementById(`section-${sections[currentSection - 1]}`)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [
        disputesRes,
        flagsRes,
        moderationRes,
        messagesRes,
        profilesRes,
        workersRes,
        employersRes,
        adminsRes,
        jobsRes,
        activeJobsRes,
        draftJobsRes,
        applicationsRes,
        pendingAppsRes,
        approvedAppsRes,
        verificationsRes,
        verifiedDocsRes,
        offersRes,
        acceptedOffersRes,
        pendingDisputesRes,
        resolvedDisputesRes,
        paymentsRes,
        pendingPaymentsRes,
        recentUsersRes,
        recentJobsRes
      ] = await Promise.all([
        supabase.from('disputes').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('content_flags').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('user_moderation').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'employer'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'DRAFT'),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'APPROVED'),
        supabase.from('worker_documents').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('worker_documents').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('offers').select('id', { count: 'exact', head: true }),
        supabase.from('offers').select('id', { count: 'exact', head: true }).eq('status', 'ACCEPTED'),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('jobs').select('id, title, location, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setDisputes(disputesRes.data || []);
      setContentFlags(flagsRes.data || []);
      setModerationActions(moderationRes.data || []);
      setMessages(messagesRes.data || []);

      // Fetch roles for recent users
      const recentUsersWithRoles: RecentUser[] = [];
      if (recentUsersRes.data) {
        for (const profile of recentUsersRes.data) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .maybeSingle();
          
          recentUsersWithRoles.push({
            ...profile,
            role: roleData?.role || 'unknown'
          });
        }
      }
      setRecentUsers(recentUsersWithRoles);
      setRecentJobs(recentJobsRes.data || []);
      
      setStats({
        totalUsers: profilesRes.count || 0,
        totalWorkers: workersRes.count || 0,
        totalEmployers: employersRes.count || 0,
        totalAdmins: adminsRes.count || 0,
        activeJobs: activeJobsRes.count || 0,
        draftJobs: draftJobsRes.count || 0,
        totalJobs: jobsRes.count || 0,
        pendingApplications: pendingAppsRes.count || 0,
        approvedApplications: approvedAppsRes.count || 0,
        totalApplications: applicationsRes.count || 0,
        pendingVerifications: verificationsRes.count || 0,
        verifiedDocuments: verifiedDocsRes.count || 0,
        totalOffers: offersRes.count || 0,
        acceptedOffers: acceptedOffersRes.count || 0,
        pendingDisputes: pendingDisputesRes.count || 0,
        resolvedDisputes: resolvedDisputesRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        pendingPayments: pendingPaymentsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'employer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'worker': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-8">
            <AdminDashboardSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Complete system overview - Manage users, jobs, and platform operations
          </p>
          {isMobile && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {sections.map((section, idx) => (
                <button
                  key={section}
                  onClick={() => {
                    setCurrentSection(idx);
                    document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                    currentSection === idx ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Key Metrics Overview */}
        <div id="section-overview" className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Platform Overview
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Users Stats */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="h-6 w-6 text-green-500" />
                  <span className="text-2xl font-bold">{stats.totalWorkers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Workers</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-6 w-6 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.totalEmployers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Employers</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-6 w-6 text-red-500" />
                  <span className="text-2xl font-bold">{stats.totalAdmins}</span>
                </div>
                <p className="text-xs text-muted-foreground">Admins</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold">{stats.activeJobs}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-6 w-6 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.totalApplications}</span>
                </div>
                <p className="text-xs text-muted-foreground">Applications</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Jobs Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Jobs Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Jobs</span>
                  <span className="font-semibold">{stats.totalJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.activeJobs}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Draft</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats.draftJobs}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Applications Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Review</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats.pendingApplications}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.approvedApplications}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verifications & Offers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verifications & Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Verifications</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats.pendingVerifications}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verified Documents</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.verifiedDocuments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Offers Accepted</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">{stats.acceptedOffers}/{stats.totalOffers}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disputes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Open Disputes</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">{stats.pendingDisputes}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Resolved</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.resolvedDisputes}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Payments</span>
                  <span className="font-semibold">{stats.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats.pendingPayments}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">System Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div id="section-users" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.length > 0 ? recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.length > 0 ? recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(job.status)}>
                        {job.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No jobs posted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disputes & Moderation */}
        <div id="section-disputes" className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <DisputeManagementCard disputes={disputes} />
          <ContentModerationCard flags={contentFlags} />
        </div>

        {/* User Management & Messages */}
        <div id="section-activity" className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <UserManagementCard 
            moderationActions={moderationActions} 
            onRefresh={fetchAdminData}
          />
          <MessageMonitoringCard messages={messages} />
        </div>
        </main>
      </div>
    </div>
  );
}
