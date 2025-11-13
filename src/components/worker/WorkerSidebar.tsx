import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Briefcase, FileText, MessageSquare, Upload, Bell, GraduationCap, FileSignature, Plane, Shield, Bookmark, BriefcaseIcon } from "lucide-react";

export default function WorkerSidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/worker/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/worker/profile", icon: User, label: "Profile" },
    { path: "/jobs", icon: Briefcase, label: "Job Search" },
    { path: "/worker/saved-searches", icon: Bookmark, label: "Saved Searches" },
    { path: "/worker/applications", icon: FileText, label: "Applications" },
    { path: "/worker/training", icon: GraduationCap, label: "Training & PDOT" },
    { path: "/worker/contracts", icon: FileSignature, label: "Contracts" },
    { path: "/worker/travel", icon: Plane, label: "Travel & Visa" },
    { path: "/worker/insurance", icon: Shield, label: "Insurance & Remittance" },
    { path: "/worker/documents", icon: Upload, label: "Documents" },
    { path: "/worker/messaging", icon: MessageSquare, label: "Messages" },
    { path: "/worker/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4 md:p-6">
      <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
        <BriefcaseIcon className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">GlobalGigs</span>
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
