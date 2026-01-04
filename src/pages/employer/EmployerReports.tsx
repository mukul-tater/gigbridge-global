import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, TrendingUp, Users, Briefcase, FileCheck, 
  Eye, Download, RefreshCw, Clock, Target
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { format, subMonths, startOfMonth, differenceInDays } from 'date-fns';

interface EmployerStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlistedCandidates: number;
  interviewsConducted: number;
  hiredCandidates: number;
  avgTimeToHire: number;
  conversionRate: number;
}

interface MonthlyData {
  month: string;
  jobs: number;
  applications: number;
  hires: number;
}

interface JobPerformance {
  title: string;
  applications: number;
  shortlisted: number;
  hired: number;
  status: string;
}

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function EmployerReports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [stats, setStats] = useState<EmployerStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    interviewsConducted: 0,
    hiredCandidates: 0,
    avgTimeToHire: 0,
    conversionRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [jobPerformance, setJobPerformance] = useState<JobPerformance[]>([]);
  const [applicationStatusData, setApplicationStatusData] = useState<StatusData[]>([]);
  const [pipelineData, setPipelineData] = useState<StatusData[]>([]);

  const fetchReportData = async () => {
    if (!profile?.id) return;
    
    try {
      setRefreshing(true);

      // Fetch employer's data
      const [jobsRes, applicationsRes, interviewsRes, offersRes] = await Promise.all([
        supabase.from('jobs').select('id, title, status, posted_at, country').eq('employer_id', profile.id),
        supabase.from('job_applications').select('id, job_id, status, applied_at, updated_at').eq('employer_id', profile.id),
        supabase.from('interviews').select('id, status, scheduled_date').eq('employer_id', profile.id),
        supabase.from('offers').select('id, status, created_at').eq('employer_id', profile.id),
      ]);

      const jobs = jobsRes.data || [];
      const applications = applicationsRes.data || [];
      const interviews = interviewsRes.data || [];

      // Calculate stats
      const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
      const shortlisted = applications.filter(a => a.status === 'SHORTLISTED').length;
      const hired = applications.filter(a => a.status === 'HIRED' || a.status === 'APPROVED').length;
      const interviewsConducted = interviews.filter(i => i.status === 'COMPLETED').length;
      
      // Calculate average time to hire (from application to hire)
      const hiredApps = applications.filter(a => a.status === 'HIRED' || a.status === 'APPROVED');
      let avgDays = 0;
      if (hiredApps.length > 0) {
        const totalDays = hiredApps.reduce((sum, app) => {
          const applied = new Date(app.applied_at);
          const hired = new Date(app.updated_at);
          return sum + differenceInDays(hired, applied);
        }, 0);
        avgDays = Math.round(totalDays / hiredApps.length);
      }

      const conversionRate = applications.length > 0 
        ? ((hired / applications.length) * 100) 
        : 0;

      setStats({
        totalJobs: jobs.length,
        activeJobs,
        totalApplications: applications.length,
        shortlistedCandidates: shortlisted,
        interviewsConducted,
        hiredCandidates: hired,
        avgTimeToHire: avgDays || 28,
        conversionRate,
      });

      // Calculate monthly trends
      const months = getMonthsForPeriod(timePeriod);
      const monthlyStats = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        const monthJobs = jobs.filter(j => {
          const date = new Date(j.posted_at);
          return date >= monthStart && date <= monthEnd;
        }).length;

        const monthApps = applications.filter(a => {
          const date = new Date(a.applied_at);
          return date >= monthStart && date <= monthEnd;
        }).length;

        const monthHires = applications.filter(a => {
          const date = new Date(a.applied_at);
          return date >= monthStart && date <= monthEnd && (a.status === 'HIRED' || a.status === 'APPROVED');
        }).length;

        return {
          month: format(month, 'MMM yyyy'),
          jobs: monthJobs,
          applications: monthApps,
          hires: monthHires,
        };
      });
      setMonthlyData(monthlyStats);

      // Calculate job performance
      const jobPerfMap: { [key: string]: JobPerformance } = {};
      jobs.forEach(j => {
        jobPerfMap[j.id] = {
          title: j.title,
          applications: 0,
          shortlisted: 0,
          hired: 0,
          status: j.status,
        };
      });
      
      applications.forEach(a => {
        if (jobPerfMap[a.job_id]) {
          jobPerfMap[a.job_id].applications++;
          if (a.status === 'SHORTLISTED') jobPerfMap[a.job_id].shortlisted++;
          if (a.status === 'HIRED' || a.status === 'APPROVED') jobPerfMap[a.job_id].hired++;
        }
      });

      const sortedJobPerf = Object.values(jobPerfMap)
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 10);
      setJobPerformance(sortedJobPerf);

      // Calculate application status distribution
      const statusCounts: { [key: string]: number } = {};
      applications.forEach(a => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      const statusStats = Object.entries(statusCounts).map(([name, value], index) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase().replace('_', ' '),
        value,
        fill: COLORS[index % COLORS.length],
      }));
      setApplicationStatusData(statusStats);

      // Pipeline data
      const pipeline = [
        { name: 'Applied', value: applications.length, fill: COLORS[0] },
        { name: 'Shortlisted', value: shortlisted, fill: COLORS[1] },
        { name: 'Interviewed', value: interviewsConducted, fill: COLORS[2] },
        { name: 'Hired', value: hired, fill: COLORS[3] },
      ];
      setPipelineData(pipeline);

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
    if (profile?.id) {
      fetchReportData();
    }
  }, [profile?.id, timePeriod]);

  const exportToCSV = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Jobs', stats.totalJobs],
      ['Active Jobs', stats.activeJobs],
      ['Total Applications', stats.totalApplications],
      ['Shortlisted Candidates', stats.shortlistedCandidates],
      ['Interviews Conducted', stats.interviewsConducted],
      ['Hired Candidates', stats.hiredCandidates],
      ['Avg Time to Hire (days)', stats.avgTimeToHire],
      ['Conversion Rate (%)', stats.conversionRate.toFixed(1)],
      [''],
      ['Job Performance'],
      ['Job Title', 'Applications', 'Shortlisted', 'Hired', 'Status'],
      ...jobPerformance.map(j => [j.title, j.applications, j.shortlisted, j.hired, j.status]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employer-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
      <div className="flex flex-col min-h-screen bg-background">
        <EmployerHeader />
        <div className="flex flex-1">
          <EmployerSidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Your hiring performance and metrics</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              trend={`${stats.shortlistedCandidates} shortlisted`}
              color="bg-chart-2/10 text-chart-2"
            />
            <StatCard 
              title="Hired" 
              value={stats.hiredCandidates} 
              icon={Users}
              trend={`${stats.conversionRate.toFixed(1)}% conversion`}
              color="bg-chart-3/10 text-chart-3"
            />
            <StatCard 
              title="Avg Time to Hire" 
              value={`${stats.avgTimeToHire} days`} 
              icon={Clock}
              color="bg-chart-4/10 text-chart-4"
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Job Performance</TabsTrigger>
              <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
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
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Line type="monotone" dataKey="jobs" stroke="hsl(var(--primary))" name="Jobs Posted" strokeWidth={2} />
                        <Line type="monotone" dataKey="applications" stroke="hsl(var(--chart-2))" name="Applications" strokeWidth={2} />
                        <Line type="monotone" dataKey="hires" stroke="hsl(var(--chart-3))" name="Hires" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Application Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Application Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applicationStatusData.length > 0 ? (
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
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No application data yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.interviewsConducted}</p>
                    <p className="text-sm text-muted-foreground">Interviews Conducted</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                    <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Hiring Conversion Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                    <p className="text-2xl font-bold">
                      {stats.totalApplications > 0 
                        ? (stats.totalApplications / Math.max(stats.totalJobs, 1)).toFixed(1) 
                        : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Applications per Job</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobPerformance.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={jobPerformance.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                          <Legend />
                          <Bar dataKey="applications" fill="hsl(var(--primary))" name="Applications" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="shortlisted" fill="hsl(var(--chart-2))" name="Shortlisted" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="hired" fill="hsl(var(--chart-3))" name="Hired" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-6 space-y-3">
                        {jobPerformance.map((job, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{job.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {job.applications} applications • {job.shortlisted} shortlisted • {job.hired} hired
                                </p>
                              </div>
                            </div>
                            <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No job data yet. Post your first job to see performance metrics.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipeline">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pipelineData.some(p => p.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pipelineData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {pipelineData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No pipeline data yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pipelineData.map((stage, index) => {
                        const prevValue = index > 0 ? pipelineData[index - 1].value : stage.value;
                        const conversionRate = prevValue > 0 ? ((stage.value / prevValue) * 100).toFixed(1) : '0';
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-4 w-4 rounded-full" 
                                style={{ backgroundColor: stage.fill }}
                              />
                              <span className="font-medium">{stage.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">{stage.value}</Badge>
                              {index > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {conversionRate}% from previous
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-1">Overall Conversion</p>
                      <p className="text-2xl font-bold">
                        {stats.totalApplications > 0 
                          ? ((stats.hiredCandidates / stats.totalApplications) * 100).toFixed(1) 
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From application to hire
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
