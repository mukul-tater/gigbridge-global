import DashboardLayout from "@/components/layout/DashboardLayout";
import { workerNavGroups, workerProfileMenu } from "@/config/workerNav";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

export default function WorkerMessaging() {
  return (
    <DashboardLayout navGroups={workerNavGroups} portalLabel="Worker Portal" portalName="Worker Portal" profileMenuItems={workerProfileMenu}>
          <PortalBreadcrumb />
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Messages</h1>

          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
            <p className="text-muted-foreground">
              When employers reach out to you, their messages will appear here.
            </p>
          </Card>
        </DashboardLayout>
  );
}
