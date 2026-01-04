import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, PlusCircle, Briefcase, Users, MessageSquare, CreditCard, Calendar, FileSignature, Shield, FileCheck, User, Bookmark, Star, UserCheck, Menu, X, History } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function EmployerSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/employer/profile", icon: User, label: "My Profile" },
    { path: "/employer/company", icon: Building2, label: "Company Profile & KYC" },
    { path: "/employer/post-job", icon: PlusCircle, label: "Post a Job" },
    { path: "/employer/manage-jobs", icon: Briefcase, label: "Manage Jobs" },
    { path: "/employer/search-workers", icon: Users, label: "Search Workers" },
    { path: "/employer/saved-searches", icon: Bookmark, label: "Saved Searches" },
    { path: "/employer/applications", icon: UserCheck, label: "Applications" },
    { path: "/employer/shortlist", icon: Star, label: "Shortlist" },
    { path: "/employer/formalities", icon: FileCheck, label: "Post-Approval Formalities" },
    { path: "/employer/contracts", icon: FileSignature, label: "Contract Management" },
    { path: "/employer/contract-history", icon: History, label: "Contract History" },
    { path: "/employer/interviews", icon: Calendar, label: "Interview Scheduling" },
    { path: "/employer/offers", icon: FileSignature, label: "Offer Management" },
    { path: "/employer/escrow", icon: Shield, label: "Escrow & Payments" },
    { path: "/employer/compliance", icon: FileCheck, label: "Compliance Reports" },
    { path: "/employer/messaging", icon: MessageSquare, label: "Messages" },
  ];

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
        <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-6 w-6" />
        <span className="text-lg font-bold text-foreground">SafeWorkGlobal</span>
      </Link>
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground font-semibold mb-4">Employer Portal</h2>
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
