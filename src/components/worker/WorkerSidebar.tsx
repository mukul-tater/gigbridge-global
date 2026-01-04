import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Briefcase, FileText, MessageSquare, Upload, Bell, GraduationCap, FileSignature, Plane, Shield, Bookmark, Menu, X, FileCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function WorkerSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/worker/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/worker/profile", icon: User, label: "Profile" },
    { path: "/jobs", icon: Briefcase, label: "Job Search" },
    { path: "/worker/saved-searches", icon: Bookmark, label: "Saved Searches" },
    { path: "/worker/applications", icon: FileText, label: "Applications" },
    { path: "/worker/application-tracking", icon: FileCheck, label: "Track Applications" },
    { path: "/worker/offers", icon: FileSignature, label: "Job Offers" },
    { path: "/worker/training", icon: GraduationCap, label: "Training & PDOT" },
    { path: "/worker/contracts", icon: FileSignature, label: "Contracts" },
    { path: "/worker/travel", icon: Plane, label: "Travel & Visa" },
    { path: "/worker/insurance", icon: Shield, label: "Insurance & Remittance" },
    { path: "/worker/documents", icon: Upload, label: "Documents" },
    { path: "/worker/messaging", icon: MessageSquare, label: "Messages" },
    { path: "/worker/notifications", icon: Bell, label: "Notifications" },
  ];

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
        <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-6 w-6" />
        <span className="text-lg font-bold text-foreground">SafeWorkGlobal</span>
      </Link>
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground font-semibold mb-4">Worker Portal</h2>
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
