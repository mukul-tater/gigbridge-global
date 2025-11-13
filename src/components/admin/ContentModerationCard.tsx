import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContentFlag {
  id: string;
  content_type: string;
  flag_reason: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface ContentModerationCardProps {
  flags: ContentFlag[];
}

export default function ContentModerationCard({ flags }: ContentModerationCardProps) {
  const navigate = useNavigate();

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'spam':
      case 'fraud':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'inappropriate':
      case 'harassment':
        return <Flag className="h-4 w-4 text-orange-500" />;
      default:
        return <Eye className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge className="bg-blue-500">Reviewed</Badge>;
      case 'actioned':
        return <Badge className="bg-green-500">Actioned</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingCount = flags.filter(f => f.status === 'pending').length;
  const reviewedCount = flags.filter(f => f.status === 'reviewed').length;
  const actionedCount = flags.filter(f => f.status === 'actioned').length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Content Moderation</h2>
            <p className="text-sm text-muted-foreground">Flagged content review</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/content-moderation')} size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending Review</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reviewedCount}</p>
          <p className="text-xs text-muted-foreground">Reviewed</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{actionedCount}</p>
          <p className="text-xs text-muted-foreground">Actioned</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No flagged content</p>
          </div>
        ) : (
          flags.slice(0, 5).map((flag) => (
            <div key={flag.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getReasonIcon(flag.flag_reason)}
                <div>
                  <p className="font-medium">{flag.content_type.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {flag.flag_reason} • {new Date(flag.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(flag.status)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
