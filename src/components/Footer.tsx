import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Globe, Facebook, Twitter, Linkedin, Instagram, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Main Footer */}
      <div className="bg-foreground text-background relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[10%] w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Company Info - Takes 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold font-heading">SafeWorkGlobal</span>
              </Link>
              <p className="text-background/60 leading-relaxed max-w-sm">
                Connecting skilled workers with verified global opportunities. Your trusted gateway to international careers since 2020.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Instagram, label: "Instagram" },
                ].map(({ icon: Icon, label }) => (
                  <Button 
                    key={label}
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-background/50 hover:text-background hover:bg-background/10 rounded-xl transition-all"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Links - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-5">
              <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/80">For Workers</h3>
              <ul className="space-y-3">
                {[
                  { to: "/jobs", label: "Find Jobs" },
                  { to: "/auth", label: "Create Profile" },
                  { to: "/about", label: "Visa Guide" },
                  { to: "/about", label: "Success Stories" },
                  { to: "/contact", label: "Support Center" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm text-background/50 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-5">
              <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/80">Resources</h3>
              <ul className="space-y-3">
                {[
                  { to: "/about", label: "Country Insights" },
                  { to: "/jobs", label: "Salary Guide" },
                  { to: "/about", label: "Language Resources" },
                  { to: "/about", label: "Cultural Guides" },
                  { to: "/contact", label: "Legal Advice" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm text-background/50 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter - Takes 4 columns */}
            <div className="lg:col-span-4 space-y-5">
              <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/80">Stay Updated</h3>
              <p className="text-background/50 text-sm">
                Get weekly updates on new opportunities and career insights.
              </p>
              <div className="p-1 rounded-xl bg-background/5 border border-background/10">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter your email" 
                    type="email"
                    className="h-11 bg-transparent border-0 text-background placeholder:text-background/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button className="h-11 px-5 rounded-lg bg-gradient-to-r from-primary to-info hover:opacity-90 gap-2 shrink-0">
                    <span className="hidden sm:inline">Subscribe</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-background/40">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Join 50,000+ subscribers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Contact Info */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
                <a href="mailto:mukultater@gmail.com" className="flex items-center gap-2 text-background/50 hover:text-background transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>mukultater@gmail.com</span>
                </a>
                <a href="tel:+919950085843" className="flex items-center gap-2 text-background/50 hover:text-background transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+91-9950085843</span>
                </a>
                <span className="flex items-center gap-2 text-background/50">
                  <Globe className="h-4 w-4" />
                  <span>15+ languages</span>
                </span>
              </div>

              {/* Legal & Copyright */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Privacy</Link>
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Terms</Link>
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Cookies</Link>
                <span className="text-background/30">|</span>
                <span className="text-background/40">© {new Date().getFullYear()} SafeWorkGlobal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;