import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Dispute {
  id: string;
  title: string;
  dispute_type: string;
  status: string;
  priority: string;
  created_at: string;
  filed_by: string;
  filed_against: string;
}

interface DisputeManagementCardProps {
  disputes: Dispute[];
}

export default function DisputeManagementCard({ disputes }: DisputeManagementCardProps) {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'escalated':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Scale className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const openCount = disputes.filter(d => d.status === 'open').length;
  const underReviewCount = disputes.filter(d => d.status === 'under_review').length;
  const urgentCount = disputes.filter(d => d.priority === 'urgent').length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Dispute Management</h2>
            <p className="text-sm text-muted-foreground">Employer-Worker disputes</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/dispute-resolution')} size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{openCount}</p>
          <p className="text-xs text-muted-foreground">Open Disputes</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{underReviewCount}</p>
          <p className="text-xs text-muted-foreground">Under Review</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{urgentCount}</p>
          <p className="text-xs text-muted-foreground">Urgent</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {disputes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No disputes to review</p>
          </div>
        ) : (
          disputes.slice(0, 5).map((dispute) => (
            <div key={dispute.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(dispute.status)}
                <div>
                  <p className="font-medium">{dispute.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {dispute.dispute_type.replace('_', ' ')} • {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getPriorityBadge(dispute.priority)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
