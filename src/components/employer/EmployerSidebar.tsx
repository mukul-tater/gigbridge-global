import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, PlusCircle, Briefcase, Users, MessageSquare, CreditCard, Calendar, FileSignature, Shield, FileCheck, User, Bookmark } from "lucide-react";

export default function EmployerSidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/employer/profile", icon: User, label: "My Profile" },
    { path: "/employer/company", icon: Building2, label: "Company Profile & KYC" },
    { path: "/employer/post-job", icon: PlusCircle, label: "Post a Job" },
    { path: "/employer/manage-jobs", icon: Briefcase, label: "Manage Jobs" },
    { path: "/employer/search-workers", icon: Users, label: "Search Workers" },
    { path: "/employer/saved-searches", icon: Bookmark, label: "Saved Searches" },
    { path: "/employer/interviews", icon: Calendar, label: "Interview Scheduling" },
    { path: "/employer/offers", icon: FileSignature, label: "Offer Management" },
    { path: "/employer/escrow", icon: Shield, label: "Escrow & Payments" },
    { path: "/employer/compliance", icon: FileCheck, label: "Compliance Reports" },
    { path: "/employer/messaging", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-6">
      <h2 className="text-lg font-bold mb-6">Employer Portal</h2>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
    </aside>
  );
}
