import { Card } from "@/components/ui/card";
import { Briefcase, Users, UserCheck, CalendarCheck, FileSignature, TrendingUp } from "lucide-react";

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
    { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Applications", value: totalApplications, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Shortlisted", value: shortlisted, icon: UserCheck, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { label: "Interviews", value: interviews, icon: CalendarCheck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { label: "Offers Sent", value: offers, icon: FileSignature, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Hired", value: hired, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 text-center hover:shadow-md transition-shadow">
          <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
