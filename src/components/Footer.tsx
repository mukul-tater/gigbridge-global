import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BriefcaseIcon, Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
const Footer = () => {
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">GlobalGigs</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Connecting skilled workers with global opportunities. Your gateway to international careers in high-demand industries.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Workers</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Find Jobs</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Create Profile</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Visa Guide</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Country Insights</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Salary Guide</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Language Resources</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Cultural Guides</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Legal Advice</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-background/80 text-sm">
              Get weekly updates on new opportunities and industry insights.
            </p>
            <div className="space-y-2">
              <Input placeholder="Enter your email" className="bg-background/10 border-background/20 text-background placeholder:text-background/60" />
              <Button variant="secondary" className="w-full">
                <Mail className="h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-background/80">mukultater@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-background/80">+91-9950085843


  </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-background/80">Available in 15+ languages</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-background/60">
            © 2024 GlobalGigs. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-background/60 hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">Terms of Service</a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;