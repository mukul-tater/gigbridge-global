import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Globe, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-9 w-9" />
              <span className="text-xl font-bold font-heading">SafeWorkGlobal</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting skilled workers with global opportunities. Your trusted gateway to international careers.
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
                  className="h-9 w-9 text-background/60 hover:text-background hover:bg-background/10 rounded-lg"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/90">For Workers</h3>
            <ul className="space-y-3 text-sm">
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
                    className="text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/90">Resources</h3>
            <ul className="space-y-3 text-sm">
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
                    className="text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-background/90">Stay Updated</h3>
            <p className="text-background/60 text-sm">
              Get weekly updates on opportunities and insights.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email" 
                type="email"
                className="h-11 bg-background/10 border-background/20 text-background placeholder:text-background/40 focus:border-background/40"
              />
              <Button variant="secondary" className="w-full h-11 gap-2 font-semibold">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
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
              <a href="mailto:mukultater@gmail.com" className="flex items-center gap-2 text-background/60 hover:text-background transition-colors">
                <Mail className="h-4 w-4" />
                <span>mukultater@gmail.com</span>
              </a>
              <a href="tel:+919950085843" className="flex items-center gap-2 text-background/60 hover:text-background transition-colors">
                <Phone className="h-4 w-4" />
                <span>+91-9950085843</span>
              </a>
              <span className="flex items-center gap-2 text-background/60">
                <Globe className="h-4 w-4" />
                <span>15+ languages</span>
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="#" className="text-background/50 hover:text-background transition-colors">Privacy</Link>
              <Link to="#" className="text-background/50 hover:text-background transition-colors">Terms</Link>
              <Link to="#" className="text-background/50 hover:text-background transition-colors">Cookies</Link>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-background/10 text-center lg:text-left">
            <p className="text-sm text-background/40">
              © {new Date().getFullYear()} SafeWorkGlobal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;