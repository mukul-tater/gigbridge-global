import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Globe, Facebook, Twitter, Linkedin, Instagram, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="bg-foreground text-background relative">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-5">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-5 w-5" />
                </div>
                <span className="text-lg sm:text-xl font-bold font-heading">SafeWorkGlobal</span>
              </Link>
              <p className="text-background/60 leading-relaxed max-w-sm text-sm">
                Connecting skilled workers with verified global opportunities. Your trusted gateway to international careers since 2020.
              </p>

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
                    className="h-9 w-9 text-background/50 hover:text-background hover:bg-background/10 rounded-lg transition-all"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* For Workers */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold font-heading uppercase tracking-wider text-background/80">For Workers</h3>
              <ul className="space-y-2.5">
                {[
                  { to: "/jobs", label: "Find Jobs" },
                  { to: "/auth", label: "Create Profile" },
                  { to: "/about", label: "Visa Guide" },
                  { to: "/about", label: "Success Stories" },
                  { to: "/contact", label: "Support Center" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-xs sm:text-sm text-background/50 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold font-heading uppercase tracking-wider text-background/80">Resources</h3>
              <ul className="space-y-2.5">
                {[
                  { to: "/about", label: "Country Insights" },
                  { to: "/jobs", label: "Salary Guide" },
                  { to: "/about", label: "Language Resources" },
                  { to: "/about", label: "Cultural Guides" },
                  { to: "/contact", label: "Legal Advice" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-xs sm:text-sm text-background/50 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold font-heading uppercase tracking-wider text-background/80">Stay Updated</h3>
              <p className="text-background/50 text-xs sm:text-sm">
                Get weekly updates on new opportunities and career insights.
              </p>
              <div className="p-1 rounded-xl bg-background/5 border border-background/10">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    className="h-10 sm:h-11 bg-transparent border-0 text-background placeholder:text-background/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  />
                  <Button className="h-10 sm:h-11 px-4 rounded-lg bg-gradient-to-r from-primary to-info hover:opacity-90 gap-1.5 shrink-0 text-sm">
                    <span className="hidden sm:inline">Subscribe</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-background/40">
                <Sparkles className="h-3 w-3" />
                <span>Join 50,000+ subscribers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm">
                <a href="mailto:mukultater@gmail.com" className="flex items-center gap-1.5 text-background/50 hover:text-background transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  <span>mukultater@gmail.com</span>
                </a>
                <a href="tel:+919950085843" className="flex items-center gap-1.5 text-background/50 hover:text-background transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  <span>+91-9950085843</span>
                </a>
                <span className="flex items-center gap-1.5 text-background/50">
                  <Globe className="h-3.5 w-3.5" />
                  <span>15+ languages</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Privacy</Link>
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Terms</Link>
                <Link to="#" className="text-background/40 hover:text-background transition-colors">Cookies</Link>
                <span className="text-background/30 hidden sm:inline">|</span>
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
