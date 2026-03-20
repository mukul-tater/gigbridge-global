import DashboardLayout from "@/components/layout/DashboardLayout";
import { employerNavGroups, employerProfileMenu } from "@/config/employerNav";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

export default function EmployerMessaging() {
  return (
    <DashboardLayout navGroups={employerNavGroups} portalLabel="Employer Portal" portalName="Employer Portal" profileMenuItems={employerProfileMenu}>
        <PortalBreadcrumb />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Messages</h1>

        <Card className="p-8 md:p-12 text-center">
          <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Start conversations with candidates or workers here.
          </p>
        </Card>
        </DashboardLayout>
  );
}
