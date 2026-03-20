import { LayoutDashboard, TrendingUp, Users, FileCheck, CreditCard, Plane, CheckCircle, Shield, BarChart3, AlertTriangle, Mail } from "lucide-react";
import type { NavGroup } from "@/components/layout/DashboardSidebar";

export const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    defaultOpen: true,
    items: [
      { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/admin/investor-dashboard", icon: TrendingUp, label: "Investor Dashboard" },
    ],
  },
  {
    label: "Users & Verification",
    defaultOpen: true,
    items: [
      { path: "/admin/users", icon: Users, label: "User Management" },
      { path: "/admin/document-verification", icon: FileCheck, label: "Documents" },
      { path: "/admin/id-verification", icon: CreditCard, label: "ID Verification" },
      { path: "/admin/ecr-management", icon: Plane, label: "ECR Management" },
    ],
  },
  {
    label: "Jobs & Compliance",
    items: [
      { path: "/admin/job-verification", icon: CheckCircle, label: "Job Verification" },
      { path: "/admin/compliance", icon: Shield, label: "Compliance" },
      { path: "/admin/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    label: "Support",
    items: [
      { path: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
      { path: "/admin/contact-submissions", icon: Mail, label: "Contact Submissions" },
    ],
  },
];

export const adminProfileMenu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
];
