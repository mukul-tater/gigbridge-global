import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserX, ShieldAlert, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UserAction {
  id: string;
  user_id: string;
  action: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  user_email?: string;
}

interface UserManagementCardProps {
  moderationActions: UserAction[];
  onRefresh: () => void;
}

export default function UserManagementCard({ moderationActions, onRefresh }: UserManagementCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'blocked':
      case 'banned':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <ShieldAlert className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  const getActionBadge = (action: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="outline">Expired</Badge>;
    
    switch (action) {
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500">Blocked</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500">Suspended</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      default:
        return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  const activeBlocksCount = moderationActions.filter(a => 
    (a.action === 'blocked' || a.action === 'banned') && a.is_active
  ).length;

  const activeSuspensionsCount = moderationActions.filter(a => 
    a.action === 'suspended' && a.is_active
  ).length;

  const warningsCount = moderationActions.filter(a => 
    a.action === 'warning' && a.is_active
  ).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">Moderation actions</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/user-management')} size="sm">
          Manage Users
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{activeBlocksCount}</p>
          <p className="text-xs text-muted-foreground">Blocked/Banned</p>
        </div>
        <div className="p-4 bg-orange-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeSuspensionsCount}</p>
          <p className="text-xs text-muted-foreground">Suspended</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningsCount}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {moderationActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No moderation actions</p>
          </div>
        ) : (
          moderationActions.slice(0, 5).map((action) => (
            <div key={action.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getActionIcon(action.action)}
                <div>
                  <p className="font-medium">{action.action.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.reason} • {new Date(action.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getActionBadge(action.action, action.is_active)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
