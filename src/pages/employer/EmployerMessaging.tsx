import DashboardLayout from "@/components/layout/DashboardLayout";
import { employerNavGroups, employerProfileMenu } from "@/config/employerNav";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";
import MessagingInbox from "@/components/messaging/MessagingInbox";

export default function EmployerMessaging() {
  return (
    <DashboardLayout navGroups={employerNavGroups} portalLabel="Employer Portal" portalName="Employer Portal" profileMenuItems={employerProfileMenu}>
      <PortalBreadcrumb />
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Messages</h1>
      <MessagingInbox />
    </DashboardLayout>
  );
}
