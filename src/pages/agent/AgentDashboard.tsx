import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, TrendingUp, DollarSign, ArrowRight, LayoutDashboard, Search, FileText, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const agentNavItems = [
  { path: "/agent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/jobs", icon: Search, label: "Browse Jobs" },
  { path: "/agent/dashboard", icon: Users, label: "Manage Workers" },
  { path: "/agent/dashboard", icon: FileText, label: "Placements" },
  { path: "/agent/dashboard", icon: DollarSign, label: "Commissions" },
  { path: "/agent/dashboard", icon: BarChart3, label: "Reports" },
  { path: "/agent/dashboard", icon: Settings, label: "Settings" },
];

const agentProfileMenu = [
  { label: "My Profile", icon: Users, path: "/agent/dashboard" },
];

export default function AgentDashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Workers Placed', value: '0', icon: Users, color: 'text-success bg-success/10' },
    { label: 'Active Jobs', value: '0', icon: Briefcase, color: 'text-primary bg-primary/10' },
    { label: 'Placements MTD', value: '0', icon: TrendingUp, color: 'text-warning bg-warning/10' },
    { label: 'Commission Earned', value: '$0', icon: DollarSign, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <DashboardLayout navItems={agentNavItems} portalLabel="Agent Portal" portalName="Agent Portal" profileMenuItems={agentProfileMenu}>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {profile?.full_name || 'Agent'}!</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage placements and connect workers with employers</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No placements yet</p>
              <p className="text-xs mt-1">Start connecting workers with employers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/jobs">
              <Button variant="outline" className="w-full justify-between">
                Browse Open Jobs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-between" disabled>
              Manage Workers <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" disabled>
              View Commissions <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
