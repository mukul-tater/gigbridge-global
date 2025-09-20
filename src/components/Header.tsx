import { Button } from "@/components/ui/button";
import { Menu, Search, Globe, User, BriefcaseIcon, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">GlobalGigs</span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#jobs" className="text-muted-foreground hover:text-primary transition-colors">
              Find Jobs
            </a>
            <a href="/alerts" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Job Alerts
            </a>
            <a href="#countries" className="text-muted-foreground hover:text-primary transition-colors">
              Countries
            </a>
            <a href="#resources" className="text-muted-foreground hover:text-primary transition-colors">
              Resources
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline">
                <User className="h-4 w-4" />
                Login
              </Button>
              <Button variant="hero">
                Join as Worker
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;