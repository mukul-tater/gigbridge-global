import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CheckCircle, Shield, BarChart3, AlertTriangle } from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/job-verification", icon: CheckCircle, label: "Job Verification" },
    { path: "/admin/compliance", icon: Shield, label: "Compliance & ECR" },
    { path: "/admin/reports", icon: BarChart3, label: "Reports & Analytics" },
    { path: "/admin/disputes", icon: AlertTriangle, label: "Dispute Resolution" },
  ];

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-6">
      <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
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
