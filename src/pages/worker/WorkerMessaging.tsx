import DashboardLayout from "@/components/layout/DashboardLayout";
import { workerNavGroups, workerProfileMenu } from "@/config/workerNav";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";
import MessagingInbox from "@/components/messaging/MessagingInbox";

export default function WorkerMessaging() {
  return (
    <DashboardLayout navGroups={workerNavGroups} portalLabel="Worker Portal" portalName="Worker Portal" profileMenuItems={workerProfileMenu}>
      <PortalBreadcrumb />
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Messages</h1>
      <MessagingInbox />
    </DashboardLayout>
  );
}
