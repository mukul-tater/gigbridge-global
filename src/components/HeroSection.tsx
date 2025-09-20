import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Globe, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-workers.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Global gig workers" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[600px] gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              Over 50,000 international opportunities
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Next 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Global </span>
              Opportunity
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Connect with employers worldwide seeking skilled workers. From construction in Japan to delivery services in Europe - your next career move awaits.
            </p>

            {/* Search Form */}
            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border max-w-2xl mx-auto lg:mx-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Job title or skill" 
                    className="pl-10 h-12"
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="japan">Japan</SelectItem>
                      <SelectItem value="russia">Russia</SelectItem>
                      <SelectItem value="nepal">Nepal</SelectItem>
                      <SelectItem value="iran">Iran</SelectItem>
                      <SelectItem value="oman">Oman</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Job Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="welding">Welding</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button size="xl" variant="hero" className="w-full">
                <Search className="h-5 w-5" />
                Search Global Jobs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">15+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="flex-1 lg:max-w-md">
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Global Reach</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Access opportunities in countries with the highest demand for skilled workers
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Country Insights</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Get detailed information about visa processes, culture, and job requirements
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-success/10 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">High Demand Areas</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Focus on regions with labor shortages and reconstruction needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;