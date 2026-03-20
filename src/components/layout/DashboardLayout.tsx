import DashboardSidebar, { NavItem, NavGroup } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { LucideIcon } from "lucide-react";

interface ProfileMenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  navGroups?: NavGroup[];
  portalLabel: string;
  portalName: string;
  profileMenuItems?: ProfileMenuItem[];
}

export default function DashboardLayout({
  children,
  navItems,
  navGroups,
  portalLabel,
  portalName,
  profileMenuItems = [],
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background w-full">
      <DashboardSidebar navItems={navItems} navGroups={navGroups} portalLabel={portalLabel} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader portalName={portalName} profileMenuItems={profileMenuItems} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
