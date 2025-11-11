import { Button } from "@/components/ui/button";
import { Menu, Search, Globe, User, BriefcaseIcon, Bell, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
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
              <Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                Find Jobs
              </Link>
              <Link to="/alerts" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Job Alerts
              </Link>
              <a href="#countries" className="text-muted-foreground hover:text-primary transition-colors">
                Countries
              </a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={toggleMobileMenu}
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="hidden md:flex items-center gap-3">
                <Link to="/auth">
                  <Button variant="outline">
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="hero">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        className={`fixed top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-50 md:hidden transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-4 py-6 space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-4">
            <Link 
              to="/jobs" 
              className="block text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMobileMenu}
            >
              Find Jobs
            </Link>
            <Link 
              to="/alerts" 
              className="block text-foreground hover:text-primary transition-colors py-2 text-lg flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <Bell className="h-5 w-5" />
              Job Alerts
            </Link>
            <a 
              href="#countries" 
              className="block text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMobileMenu}
            >
              Countries
            </a>
            <a 
              href="#about" 
              className="block text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMobileMenu}
            >
              About
            </a>
          </nav>

          {/* Mobile Auth Actions */}
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/auth" onClick={closeMobileMenu}>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Login / Sign Up
              </Button>
            </Link>
            <Link to="/dashboard" onClick={closeMobileMenu}>
              <Button variant="hero" className="w-full">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;