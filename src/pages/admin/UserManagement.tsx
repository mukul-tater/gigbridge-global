import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_banned: boolean;
  joined: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"ban" | "unban" | null>(null);
  const [reason, setReason] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at");

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch active moderation actions
      const { data: moderations, error: moderationsError } = await supabase
        .from("user_moderation")
        .select("user_id, action, is_active")
        .eq("is_active", true);

      if (moderationsError) throw moderationsError;

      // Combine data
      const usersData: User[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        const moderation = moderations.find((m) => m.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: userRole?.role || "worker",
          is_banned: moderation?.action === "ban" || moderation?.action === "suspend",
          joined: new Date(profile.created_at).toISOString().split("T")[0],
        };
      });

      setUsers(usersData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUnban = async () => {
    if (!selectedUser || !actionType || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      if (actionType === "ban") {
        // Create ban record
        const { error } = await supabase.from("user_moderation").insert({
          user_id: selectedUser.id,
          action: "ban",
          reason: reason.trim(),
          actioned_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
        });

        if (error) throw error;
        toast.success(`${selectedUser.full_name || selectedUser.email} has been banned`);
      } else {
        // Deactivate all active bans/suspensions
        const { error } = await supabase
          .from("user_moderation")
          .update({ is_active: false })
          .eq("user_id", selectedUser.id)
          .eq("is_active", true);

        if (error) throw error;
        toast.success(`${selectedUser.full_name || selectedUser.email} has been unbanned`);
      }

      setShowDialog(false);
      setReason("");
      setSelectedUser(null);
      setActionType(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const openBanDialog = (user: User, type: "ban" | "unban") => {
    setSelectedUser(user);
    setActionType(type);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">User Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{user.full_name || "No Name"}</h3>
                    <Badge variant={user.role === "worker" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.is_banned ? "destructive" : "default"}>
                      {user.is_banned ? "Banned" : "Active"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Joined {user.joined}</p>
                </div>
                <div className="flex gap-2">
                  {user.is_banned ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openBanDialog(user, "unban")}
                      title="Unban user"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openBanDialog(user, "ban")}
                      title="Ban user"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "ban" ? "Ban User" : "Unban User"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "ban"
                ? `Are you sure you want to ban ${selectedUser?.full_name || selectedUser?.email}?`
                : `Are you sure you want to unban ${selectedUser?.full_name || selectedUser?.email}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for this action..."
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBanUnban} disabled={!reason.trim()}>
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
