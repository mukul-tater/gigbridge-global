import { Card } from "@/components/ui/card";
import { Briefcase, Users, UserCheck, CalendarCheck, FileSignature, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickStatsRowProps {
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  hired: number;
}

export default function QuickStatsRow({ activeJobs, totalApplications, shortlisted, interviews, offers, hired }: QuickStatsRowProps) {
  const stats = [
    { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-primary", bg: "bg-primary/10", to: "/employer/manage-jobs" },
    { label: "Applications", value: totalApplications, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", to: "/employer/applications" },
    { label: "Shortlisted", value: shortlisted, icon: UserCheck, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", to: "/employer/shortlist" },
    { label: "Interviews", value: interviews, icon: CalendarCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", to: "/employer/interviews" },
    { label: "Offers Sent", value: offers, icon: FileSignature, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", to: "/employer/offers" },
    { label: "Hired", value: hired, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", to: "/employer/applications?status=HIRED" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Link key={stat.label} to={stat.to} className="block group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
          <Card className="p-4 text-center hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer h-full">
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
