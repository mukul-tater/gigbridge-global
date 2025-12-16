import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Search, Globe, User, BriefcaseIcon, Bell, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    closeMobileMenu();
  };

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
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SafeWorkGlobal</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                Find Jobs
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
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
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {profile?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">
                        {profile?.full_name || 'Dashboard'}
                      </span>
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Menu Content */}
          <div 
            id="mobile-menu"
            className="fixed top-16 left-0 right-0 bottom-16 bg-card border-b border-border z-50 md:hidden overflow-y-auto animate-in slide-in-from-top-2 duration-300"
          >
            <nav className="container mx-auto px-4 py-6 space-y-4">
              <Link 
                to="/jobs" 
                className="block px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Find Jobs</span>
                </div>
              </Link>
              
              <Link 
                to="/about" 
                className="block px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">About Us</span>
                </div>
              </Link>
              
              <Link 
                to="/contact" 
                className="block px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Contact Us</span>
                </div>
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;