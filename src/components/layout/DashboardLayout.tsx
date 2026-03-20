import DashboardSidebar, { NavItem } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { LucideIcon } from "lucide-react";

interface ProfileMenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  portalLabel: string;
  portalName: string;
  profileMenuItems?: ProfileMenuItem[];
}

export default function DashboardLayout({
  children,
  navItems,
  portalLabel,
  portalName,
  profileMenuItems = [],
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background w-full">
      <DashboardSidebar navItems={navItems} portalLabel={portalLabel} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader portalName={portalName} profileMenuItems={profileMenuItems} />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
