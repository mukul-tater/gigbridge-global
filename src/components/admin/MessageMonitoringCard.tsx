import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Flag, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  content: string;
  is_flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
}

interface MessageMonitoringCardProps {
  messages: Message[];
}

export default function MessageMonitoringCard({ messages }: MessageMonitoringCardProps) {
  const navigate = useNavigate();

  const flaggedCount = messages.filter(m => m.is_flagged).length;
  const totalMessages = messages.length;
  const recentCount = messages.filter(m => {
    const messageDate = new Date(m.created_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return messageDate > oneDayAgo;
  }).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Message Monitoring</h2>
            <p className="text-sm text-muted-foreground">Platform communications</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/messages')} size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-primary/10 rounded-lg text-center">
          <p className="text-2xl font-bold">{totalMessages}</p>
          <p className="text-xs text-muted-foreground">Total Messages</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{recentCount}</p>
          <p className="text-xs text-muted-foreground">Last 24 Hours</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{flaggedCount}</p>
          <p className="text-xs text-muted-foreground">Flagged</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No messages to monitor</p>
          </div>
        ) : (
          messages.slice(0, 5).map((message) => (
            <div key={message.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <MessageSquare className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {message.subject || 'No subject'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {message.content.substring(0, 50)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {message.is_flagged && (
                <Badge variant="destructive" className="ml-2">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
