import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, FileSignature, Calendar, MessageSquare, DollarSign, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'payment' | 'job' | 'message';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  applications: any[];
  jobs: any[];
  payments: any[];
}

export default function RecentActivityFeed({ applications, jobs, payments }: RecentActivityFeedProps) {
  const activities: ActivityItem[] = [];

  // Add recent applications
  applications.slice(0, 5).forEach(app => {
    activities.push({
      id: `app-${app.id}`,
      type: 'application',
      title: 'New Application',
      description: `Application received for ${app.job_id?.substring(0, 8)}...`,
      timestamp: app.applied_at || app.created_at,
    });
  });

  // Add recent jobs
  jobs.filter(j => j.status === 'ACTIVE').slice(0, 3).forEach(job => {
    activities.push({
      id: `job-${job.id}`,
      type: 'job',
      title: 'Job Active',
      description: `"${job.title}" is live and accepting applications`,
      timestamp: job.posted_at || job.created_at,
    });
  });

  // Add recent payments
  payments.slice(0, 3).forEach(p => {
    activities.push({
      id: `pay-${p.id}`,
      type: 'payment',
      title: p.escrow_status === 'HELD' ? 'Payment Held' : p.escrow_status === 'RELEASED' ? 'Payment Released' : 'Payment',
      description: `₹${Number(p.amount).toLocaleString('en-IN')} - ${p.description || p.payment_type}`,
      timestamp: p.created_at,
    });
  });

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (type: string) => {
    switch (type) {
      case 'application': return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'interview': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'offer': return <FileSignature className="h-4 w-4 text-green-500" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'job': return <Briefcase className="h-4 w-4 text-primary" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
      <div className="space-y-1 max-h-[350px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.slice(0, 10).map((activity, idx) => (
            <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mt-0.5 p-1.5 rounded-full bg-muted">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
