import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CheckCircle, Shield, BarChart3, AlertTriangle, BriefcaseIcon, Menu, FileCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/job-verification", icon: CheckCircle, label: "Job Verification" },
    { path: "/admin/document-verification", icon: FileCheck, label: "Document Verification" },
    { path: "/admin/compliance", icon: Shield, label: "Compliance & ECR" },
    { path: "/admin/reports", icon: BarChart3, label: "Reports & Analytics" },
    { path: "/admin/disputes", icon: AlertTriangle, label: "Dispute Resolution" },
  ];

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
        <BriefcaseIcon className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">GlobalGigs</span>
      </Link>
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground font-semibold mb-4">Admin Panel</h2>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-card border rounded-lg shadow-lg md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className="hidden md:block w-64 bg-card border-r min-h-screen p-4 md:p-6">
      <SidebarContent />
    </aside>
  );
}
