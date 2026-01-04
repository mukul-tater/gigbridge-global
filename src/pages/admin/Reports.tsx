import { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, TrendingUp, Users, Briefcase, FileCheck, 
  DollarSign, Globe, Download, RefreshCw
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { format, subMonths, startOfMonth } from 'date-fns';

interface ReportStats {
  totalJobs: number;
  totalApplications: number;
  totalWorkers: number;
  totalEmployers: number;
  activeJobs: number;
  hiredWorkers: number;
  totalPayments: number;
  pendingVerifications: number;
}

interface MonthlyData {
  month: string;
  jobs: number;
  applications: number;
  hires: number;
}

interface CountryData {
  country: string;
  jobs: number;
  fill: string;
}

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [stats, setStats] = useState<ReportStats>({
    totalJobs: 0,
    totalApplications: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    activeJobs: 0,
    hiredWorkers: 0,
    totalPayments: 0,
    pendingVerifications: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [applicationStatusData, setApplicationStatusData] = useState<StatusData[]>([]);

  const fetchReportData = async () => {
    try {
      setRefreshing(true);

      // Fetch jobs stats
      const { data: jobs } = await supabase.from('jobs').select('id, status, country, posted_at');
      const { data: applications } = await supabase.from('job_applications').select('id, status, applied_at');
      const { data: workers } = await supabase.from('worker_profiles').select('id');
      const { data: employers } = await supabase.from('employer_profiles').select('id');
      const { data: payments } = await supabase.from('payments').select('amount, status');
      const { data: verifications } = await supabase.from('background_verifications').select('id, status');

      // Calculate stats
      const activeJobs = jobs?.filter(j => j.status === 'ACTIVE').length || 0;
      const hiredCount = applications?.filter(a => a.status === 'HIRED' || a.status === 'APPROVED').length || 0;
      const totalPaymentAmount = payments?.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingVerifs = verifications?.filter(v => v.status === 'PENDING').length || 0;

      setStats({
        totalJobs: jobs?.length || 0,
        totalApplications: applications?.length || 0,
        totalWorkers: workers?.length || 0,
        totalEmployers: employers?.length || 0,
        activeJobs,
        hiredWorkers: hiredCount,
        totalPayments: totalPaymentAmount,
        pendingVerifications: pendingVerifs,
      });

      // Calculate monthly trends
      const months = getMonthsForPeriod(timePeriod);
      const monthlyStats = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        const monthJobs = jobs?.filter(j => {
          const date = new Date(j.posted_at);
          return date >= monthStart && date <= monthEnd;
        }).length || 0;

        const monthApps = applications?.filter(a => {
          const date = new Date(a.applied_at);
          return date >= monthStart && date <= monthEnd;
        }).length || 0;

        const monthHires = applications?.filter(a => {
          const date = new Date(a.applied_at);
          return date >= monthStart && date <= monthEnd && (a.status === 'HIRED' || a.status === 'APPROVED');
        }).length || 0;

        return {
          month: format(month, 'MMM yyyy'),
          jobs: monthJobs,
          applications: monthApps,
          hires: monthHires,
        };
      });
      setMonthlyData(monthlyStats);

      // Calculate country distribution
      const countryCounts: { [key: string]: number } = {};
      jobs?.forEach(j => {
        countryCounts[j.country] = (countryCounts[j.country] || 0) + 1;
      });
      const countryStats = Object.entries(countryCounts)
        .map(([country, count], index) => ({
          country,
          jobs: count,
          fill: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.jobs - a.jobs)
        .slice(0, 5);
      setCountryData(countryStats);

      // Calculate application status distribution
      const statusCounts: { [key: string]: number } = {};
      applications?.forEach(a => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      const statusStats = Object.entries(statusCounts).map(([name, value], index) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase().replace('_', ' '),
        value,
        fill: COLORS[index % COLORS.length],
      }));
      setApplicationStatusData(statusStats);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMonthsForPeriod = (period: string): Date[] => {
    const months: Date[] = [];
    const count = period === '3months' ? 3 : period === '6months' ? 6 : 12;
    for (let i = count - 1; i >= 0; i--) {
      months.push(subMonths(new Date(), i));
    }
    return months;
  };

  useEffect(() => {
    fetchReportData();
  }, [timePeriod]);

  const exportToCSV = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Jobs', stats.totalJobs],
      ['Active Jobs', stats.activeJobs],
      ['Total Applications', stats.totalApplications],
      ['Hired Workers', stats.hiredWorkers],
      ['Total Workers', stats.totalWorkers],
      ['Total Employers', stats.totalEmployers],
      ['Total Payments', stats.totalPayments],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    trend?: string;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
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
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Platform performance insights and metrics</p>
          </div>
          <div className="flex gap-3">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchReportData()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Jobs" 
            value={stats.totalJobs} 
            icon={Briefcase}
            trend={`${stats.activeJobs} active`}
            color="bg-primary/10 text-primary"
          />
          <StatCard 
            title="Applications" 
            value={stats.totalApplications} 
            icon={FileCheck}
            trend={`${stats.hiredWorkers} hired`}
            color="bg-chart-2/10 text-chart-2"
          />
          <StatCard 
            title="Workers" 
            value={stats.totalWorkers} 
            icon={Users}
            color="bg-chart-3/10 text-chart-3"
          />
          <StatCard 
            title="Employers" 
            value={stats.totalEmployers} 
            icon={Globe}
            color="bg-chart-4/10 text-chart-4"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs Analytics</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="jobs" stroke="hsl(var(--primary))" name="Jobs Posted" strokeWidth={2} />
                      <Line type="monotone" dataKey="applications" stroke="hsl(var(--chart-2))" name="Applications" strokeWidth={2} />
                      <Line type="monotone" dataKey="hires" stroke="hsl(var(--chart-3))" name="Hires" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Application Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">${stats.totalPayments.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Payments Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <FileCheck className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">
                    {stats.totalApplications > 0 
                      ? ((stats.hiredWorkers / stats.totalApplications) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Jobs Posted Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" fill="hsl(var(--primary))" name="Jobs Posted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Applications vs Hires</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" fill="hsl(var(--chart-2))" name="Applications" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hires" fill="hsl(var(--chart-3))" name="Hires" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applicationStatusData.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: status.fill }}
                          />
                          <span>{status.name}</span>
                        </div>
                        <Badge variant="secondary">{status.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography">
            <Card>
              <CardHeader>
                <CardTitle>Jobs by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={countryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Top Hiring Countries</h4>
                    {countryData.map((country, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <span className="text-muted-foreground">{country.jobs} jobs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
