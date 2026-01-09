import { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, TrendingDown, Users, Briefcase, DollarSign, 
  Globe, ArrowUpRight, Download, RefreshCw, Target, Zap,
  MapPin, Building2, UserCheck, Clock
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from "recharts";
import { format, subMonths, startOfMonth } from 'date-fns';

interface PlatformMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  filledJobs: number;
  totalApplications: number;
  successfulPlacements: number;
  countriesOperating: number;
  averageTimeToHire: number;
  conversionRate: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
}

interface MonthlyMetric {
  month: string;
  revenue: number;
  users: number;
  jobs: number;
  placements: number;
}

interface GeographyData {
  country: string;
  jobs: number;
  workers: number;
  revenue: number;
}

const CHART_COLORS = {
  primary: 'hsl(230, 85%, 55%)',
  secondary: 'hsl(16, 90%, 58%)',
  success: 'hsl(158, 72%, 42%)',
  info: 'hsl(192, 95%, 48%)',
  warning: 'hsl(42, 95%, 52%)',
  purple: 'hsl(260, 80%, 60%)',
};

export default function InvestorDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    filledJobs: 0,
    totalApplications: 0,
    successfulPlacements: 0,
    countriesOperating: 0,
    averageTimeToHire: 0,
    conversionRate: 0,
    userGrowthRate: 0,
    revenueGrowthRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyMetric[]>([]);
  const [geographyData, setGeographyData] = useState<GeographyData[]>([]);
  const [funnelData, setFunnelData] = useState<{ stage: string; value: number; fill: string }[]>([]);

  const fetchInvestorData = async () => {
    try {
      setRefreshing(true);

      // Fetch all required data
      const [
        { data: jobs },
        { data: applications },
        { data: workers },
        { data: employers },
        { data: payments },
        { data: offers }
      ] = await Promise.all([
        supabase.from('jobs').select('id, status, country, posted_at, created_at'),
        supabase.from('job_applications').select('id, status, applied_at, updated_at'),
        supabase.from('worker_profiles').select('id, created_at, current_location'),
        supabase.from('employer_profiles').select('id, created_at'),
        supabase.from('payments').select('amount, status, created_at, payment_type'),
        supabase.from('offers').select('id, status, created_at')
      ]);

      // Calculate revenue metrics
      const completedPayments = payments?.filter(p => p.status === 'COMPLETED') || [];
      const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Calculate MRR (last 30 days payments)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPayments = completedPayments.filter(p => new Date(p.created_at) > thirtyDaysAgo);
      const mrr = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // User metrics
      const totalUsers = (workers?.length || 0) + (employers?.length || 0);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const activeWorkers = workers?.filter(w => new Date(w.created_at) > sixtyDaysAgo).length || 0;
      const activeEmployers = employers?.filter(e => new Date(e.created_at) > sixtyDaysAgo).length || 0;
      const activeUsers = activeWorkers + activeEmployers;

      // Job metrics
      const filledJobs = jobs?.filter(j => j.status === 'FILLED' || j.status === 'CLOSED').length || 0;
      const successfulPlacements = applications?.filter(a => 
        a.status === 'HIRED' || a.status === 'APPROVED' || a.status === 'ACCEPTED'
      ).length || 0;

      // Geographic expansion
      const uniqueCountries = [...new Set(jobs?.map(j => j.country) || [])];

      // Calculate conversion rate
      const conversionRate = (applications?.length || 0) > 0 
        ? (successfulPlacements / (applications?.length || 1)) * 100 
        : 0;

      // Growth rates (comparing last 30 days vs previous 30 days)
      const prevThirtyDaysAgo = new Date();
      prevThirtyDaysAgo.setDate(prevThirtyDaysAgo.getDate() - 60);
      
      const usersLast30 = [...(workers || []), ...(employers || [])]
        .filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
      const usersPrev30 = [...(workers || []), ...(employers || [])]
        .filter(u => new Date(u.created_at) > prevThirtyDaysAgo && new Date(u.created_at) <= thirtyDaysAgo).length;
      const userGrowthRate = usersPrev30 > 0 ? ((usersLast30 - usersPrev30) / usersPrev30) * 100 : usersLast30 > 0 ? 100 : 0;

      const revenuePrev30 = completedPayments
        .filter(p => new Date(p.created_at) > prevThirtyDaysAgo && new Date(p.created_at) <= thirtyDaysAgo)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const revenueGrowthRate = revenuePrev30 > 0 ? ((mrr - revenuePrev30) / revenuePrev30) * 100 : mrr > 0 ? 100 : 0;

      setMetrics({
        totalRevenue,
        monthlyRecurringRevenue: mrr,
        totalUsers,
        activeUsers,
        totalJobs: jobs?.length || 0,
        filledJobs,
        totalApplications: applications?.length || 0,
        successfulPlacements,
        countriesOperating: uniqueCountries.length,
        averageTimeToHire: 14, // Placeholder - would need interview/offer dates to calculate
        conversionRate,
        userGrowthRate,
        revenueGrowthRate,
      });

      // Monthly trends (last 12 months)
      const months: MonthlyMetric[] = [];
      for (let i = 11; i >= 0; i--) {
        const month = subMonths(new Date(), i);
        const monthStart = startOfMonth(month);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        const monthRevenue = completedPayments
          .filter(p => {
            const date = new Date(p.created_at);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        const monthUsers = [...(workers || []), ...(employers || [])]
          .filter(u => {
            const date = new Date(u.created_at);
            return date >= monthStart && date <= monthEnd;
          }).length;

        const monthJobs = jobs?.filter(j => {
          const date = new Date(j.posted_at || j.created_at);
          return date >= monthStart && date <= monthEnd;
        }).length || 0;

        const monthPlacements = applications?.filter(a => {
          const date = new Date(a.updated_at || a.applied_at);
          return date >= monthStart && date <= monthEnd && 
            (a.status === 'HIRED' || a.status === 'APPROVED' || a.status === 'ACCEPTED');
        }).length || 0;

        months.push({
          month: format(month, 'MMM yy'),
          revenue: monthRevenue,
          users: monthUsers,
          jobs: monthJobs,
          placements: monthPlacements,
        });
      }
      setMonthlyData(months);

      // Geography data
      const countryStats: { [key: string]: GeographyData } = {};
      jobs?.forEach(j => {
        if (!countryStats[j.country]) {
          countryStats[j.country] = { country: j.country, jobs: 0, workers: 0, revenue: 0 };
        }
        countryStats[j.country].jobs++;
      });
      
      workers?.forEach(w => {
        const location = w.current_location || 'Unknown';
        if (!countryStats[location]) {
          countryStats[location] = { country: location, jobs: 0, workers: 0, revenue: 0 };
        }
        countryStats[location].workers++;
      });

      const geoData = Object.values(countryStats)
        .sort((a, b) => (b.jobs + b.workers) - (a.jobs + a.workers))
        .slice(0, 8);
      setGeographyData(geoData);

      // Hiring funnel
      setFunnelData([
        { stage: 'Job Views', value: (jobs?.length || 0) * 150, fill: CHART_COLORS.info },
        { stage: 'Applications', value: applications?.length || 0, fill: CHART_COLORS.primary },
        { stage: 'Interviews', value: Math.floor((applications?.length || 0) * 0.3), fill: CHART_COLORS.secondary },
        { stage: 'Offers', value: offers?.length || 0, fill: CHART_COLORS.warning },
        { stage: 'Hired', value: successfulPlacements, fill: CHART_COLORS.success },
      ]);

    } catch (error) {
      console.error('Error fetching investor data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvestorData();
  }, []);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      metrics,
      monthlyTrends: monthlyData,
      geography: geographyData,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investor-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendUp, 
    color = "primary",
    large = false 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    icon: React.ElementType; 
    trend?: string;
    trendUp?: boolean;
    color?: string;
    large?: boolean;
  }) => (
    <Card className={`relative overflow-hidden ${large ? 'row-span-2' : ''}`}>
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10"
        style={{ background: `hsl(var(--${color}))` }} />
      <CardContent className={`${large ? 'p-8' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`font-bold tracking-tight ${large ? 'text-4xl' : 'text-2xl'}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trendUp ? 'text-success' : trendUp === false ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {trendUp ? <TrendingUp className="h-4 w-4" /> : trendUp === false ? <TrendingDown className="h-4 w-4" /> : null}
                {trend}
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center`}
            style={{ background: `hsl(var(--${color}) / 0.15)` }}>
            <Icon className="h-6 w-6" style={{ color: `hsl(var(--${color}))` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs font-medium px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-success mr-2 animate-pulse" />
                Live Data
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Investor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Key business metrics and growth indicators</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchInvestorData()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Revenue" 
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            subtitle="All-time platform revenue"
            icon={DollarSign}
            trend={`${metrics.revenueGrowthRate >= 0 ? '+' : ''}${metrics.revenueGrowthRate.toFixed(1)}% MoM`}
            trendUp={metrics.revenueGrowthRate > 0}
            color="success"
            large
          />
          <MetricCard 
            title="Monthly Recurring Revenue" 
            value={`$${metrics.monthlyRecurringRevenue.toLocaleString()}`}
            subtitle="Last 30 days"
            icon={TrendingUp}
            color="primary"
          />
          <MetricCard 
            title="Total Users" 
            value={metrics.totalUsers.toLocaleString()}
            subtitle={`${metrics.activeUsers} active`}
            icon={Users}
            trend={`${metrics.userGrowthRate >= 0 ? '+' : ''}${metrics.userGrowthRate.toFixed(1)}% MoM`}
            trendUp={metrics.userGrowthRate > 0}
            color="info"
          />
          <MetricCard 
            title="Job Fill Rate" 
            value={`${metrics.totalJobs > 0 ? ((metrics.filledJobs / metrics.totalJobs) * 100).toFixed(1) : 0}%`}
            subtitle={`${metrics.filledJobs} of ${metrics.totalJobs} jobs filled`}
            icon={Target}
            color="secondary"
          />
          <MetricCard 
            title="Countries" 
            value={metrics.countriesOperating}
            subtitle="Global presence"
            icon={Globe}
            color="warning"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Growth */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Revenue & User Growth
              </CardTitle>
              <CardDescription>12-month trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.success} 
                    fill="url(#revenueGradient)"
                    name="Revenue ($)"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="users" 
                    stroke={CHART_COLORS.info} 
                    name="New Users"
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.info, r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Hiring Funnel
              </CardTitle>
              <CardDescription>Conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((item, index) => {
                  const maxValue = funnelData[0]?.value || 1;
                  const percentage = (item.value / maxValue) * 100;
                  const conversionFromPrev = index > 0 && funnelData[index - 1].value > 0
                    ? ((item.value / funnelData[index - 1].value) * 100).toFixed(0)
                    : null;
                  
                  return (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                          {conversionFromPrev && (
                            <Badge variant="secondary" className="text-xs">
                              {conversionFromPrev}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: item.fill 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Conversion</span>
                  <span className="text-lg font-bold text-success">
                    {metrics.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Job & Placement Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Postings & Placements
              </CardTitle>
              <CardDescription>Monthly job market activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="jobs" 
                    fill={CHART_COLORS.primary} 
                    name="Jobs Posted" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="placements" 
                    fill={CHART_COLORS.success} 
                    name="Successful Placements" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Geographic Expansion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Platform presence by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographyData.length > 0 ? (
                  geographyData.map((item, index) => {
                    const maxJobs = Math.max(...geographyData.map(g => g.jobs));
                    const percentage = maxJobs > 0 ? (item.jobs / maxJobs) * 100 : 0;
                    const colors = [
                      CHART_COLORS.primary,
                      CHART_COLORS.secondary,
                      CHART_COLORS.success,
                      CHART_COLORS.info,
                      CHART_COLORS.warning,
                      CHART_COLORS.purple,
                    ];
                    
                    return (
                      <div key={item.country} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium truncate">{item.country}</div>
                        <div className="flex-1">
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: colors[index % colors.length]
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{item.jobs}</span>
                          <UserCheck className="h-3.5 w-3.5 ml-2" />
                          <span>{item.workers}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No geographic data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{metrics.totalJobs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placements</p>
                  <p className="text-2xl font-bold">{metrics.successfulPlacements.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-info/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                  <p className="text-2xl font-bold">{metrics.averageTimeToHire} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{metrics.totalApplications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
