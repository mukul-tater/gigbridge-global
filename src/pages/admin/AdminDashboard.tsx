import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, AlertTriangle, CheckCircle, Shield, Flag, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DisputeManagementCard from "@/components/admin/DisputeManagementCard";
import ContentModerationCard from "@/components/admin/ContentModerationCard";
import UserManagementCard from "@/components/admin/UserManagementCard";
import MessageMonitoringCard from "@/components/admin/MessageMonitoringCard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [contentFlags, setContentFlags] = useState([]);
  const [moderationActions, setModerationActions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    pendingVerifications: 0,
    platformHealth: 98
  });
  const [loading, setLoading] = useState(true);

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
        jobsRes,
        verificationsRes
      ] = await Promise.all([
        supabase.from('disputes').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('content_flags').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('user_moderation').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('worker_documents').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending')
      ]);

      setDisputes(disputesRes.data || []);
      setContentFlags(flagsRes.data || []);
      setModerationActions(moderationRes.data || []);
      setMessages(messagesRes.data || []);
      
      setStats({
        totalUsers: profilesRes.count || 0,
        activeJobs: jobsRes.count || 0,
        pendingVerifications: verificationsRes.count || 0,
        platformHealth: 98
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{stats.activeJobs}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pendingVerifications}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Verifications</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.platformHealth}%</span>
            </div>
            <p className="text-sm text-muted-foreground">Platform Health</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <DisputeManagementCard disputes={disputes} />
          <ContentModerationCard flags={contentFlags} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UserManagementCard 
            moderationActions={moderationActions} 
            onRefresh={fetchAdminData}
          />
          <MessageMonitoringCard messages={messages} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="bg-primary/10 p-2 rounded">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New employer registered</p>
                    <p className="text-sm text-muted-foreground">ShreeFab Industries • 2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Pending Actions</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">Job verification required</h3>
                  <p className="text-sm text-muted-foreground">Senior Welder position needs review</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
