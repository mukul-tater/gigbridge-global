import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Briefcase, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  shortlistedCandidates: number;
  hiredCandidates: number;
  avgTimeToHire: number;
  conversionRate: number;
}

interface AnalyticsSummaryCardProps {
  data: AnalyticsData;
}

export default function AnalyticsSummaryCard({ data }: AnalyticsSummaryCardProps) {
  const metrics = [
    {
      label: "Active Jobs",
      value: data.activeJobs,
      total: data.totalJobs,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/employer/manage-jobs"
    },
    {
      label: "Total Applications",
      value: data.totalApplications,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: "+12%",
      link: "/employer/applications"
    },
    {
      label: "Job Views",
      value: data.totalViews,
      icon: Eye,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      trend: "+8%",
      link: "/employer/manage-jobs"
    },
    {
      label: "Shortlisted",
      value: data.shortlistedCandidates,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      link: "/employer/shortlist"
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Link key={index} to={metric.link}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            {metric.trend && (
              <div className={`flex items-center gap-1 ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{metric.trend}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">
              {metric.value}
              {metric.total && (
                <span className="text-lg text-muted-foreground">/{metric.total}</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
