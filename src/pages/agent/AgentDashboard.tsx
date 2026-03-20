import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, TrendingUp, DollarSign, ArrowRight, LayoutDashboard, Search, FileText, BarChart3, Settings, UserPlus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NavGroup } from '@/components/layout/DashboardSidebar';

const agentNavGroups: NavGroup[] = [
  {
    label: "Overview",
    defaultOpen: true,
    items: [
      { path: "/agent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/jobs", icon: Search, label: "Browse Jobs" },
    ],
  },
  {
    label: "Management",
    defaultOpen: true,
    items: [
      { path: "/agent/dashboard", icon: Users, label: "My Workers" },
      { path: "/agent/dashboard", icon: ClipboardList, label: "Placements" },
      { path: "/agent/dashboard", icon: DollarSign, label: "Commissions" },
    ],
  },
  {
    label: "Reports",
    items: [
      { path: "/agent/dashboard", icon: BarChart3, label: "Analytics" },
      { path: "/agent/dashboard", icon: Settings, label: "Settings" },
    ],
  },
];

const agentProfileMenu = [
  { label: "My Profile", icon: Users, path: "/agent/dashboard" },
];

export default function AgentDashboard() {
  const { profile } = useAuth();
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      Promise.all([
        supabase.from('agent_profiles').select('*').eq('user_id', profile.id).single(),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      ]).then(([agentRes, jobsRes]) => {
        setAgentProfile(agentRes.data);
        setActiveJobs(jobsRes.count || 0);
      });
    }
  }, [profile?.id]);

  const stats = [
    { label: 'Workers Placed', value: agentProfile?.total_placements || 0, icon: Users, color: 'text-success bg-success/10' },
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-primary bg-primary/10' },
    { label: 'Placements MTD', value: 0, icon: TrendingUp, color: 'text-warning bg-warning/10' },
    { label: 'Commission Rate', value: `${agentProfile?.commission_rate || 5}%`, icon: DollarSign, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <DashboardLayout navGroups={agentNavGroups} portalLabel="Agent Portal" portalName="Agent Portal" profileMenuItems={agentProfileMenu}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome, {profile?.full_name || 'Agent'}!</h1>
        <p className="text-muted-foreground text-sm">Manage placements and connect workers with employers</p>
        {agentProfile?.agency_name && (
          <Badge variant="outline" className="mt-2">{agentProfile.agency_name}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No placements yet</p>
              <p className="text-xs mt-1">Start connecting workers with employers</p>
              <Link to="/jobs">
                <Button size="sm" className="mt-4">
                  Browse Jobs <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/jobs">
              <Button variant="outline" className="w-full justify-between h-11">
                <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Browse Open Jobs</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-between h-11" disabled>
              <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add Worker</span>
              <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between h-11" disabled>
              <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> View Reports</span>
              <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {agentProfile?.regions_covered && agentProfile.regions_covered.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-2">Regions Covered</h3>
          <div className="flex flex-wrap gap-1.5">
            {agentProfile.regions_covered.map((region: string) => (
              <Badge key={region} variant="secondary">{region}</Badge>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
