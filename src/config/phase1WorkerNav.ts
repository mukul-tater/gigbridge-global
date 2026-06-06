import { LayoutDashboard, User } from "lucide-react";
import type { NavGroup } from "@/components/layout/DashboardSidebar";

/** Navigation for Phase-1 worker portal (backend API auth). */
export const phase1WorkerNavGroups: NavGroup[] = [
  {
    label: "Overview",
    defaultOpen: true,
    items: [
      { path: "/home", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/onboarding", icon: User, label: "Complete Profile" },
    ],
  },
];

export const phase1WorkerProfileMenu = [
  { label: "Complete Profile", icon: User, path: "/onboarding" },
];
