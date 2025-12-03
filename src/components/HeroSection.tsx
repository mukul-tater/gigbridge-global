import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Globe, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-workers.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.6;
      setIsSticky(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (searchLocation) params.set('location', searchLocation);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/jobs?${params.toString()}`);
  };
  return (
    <section className="relative min-h-[700px] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Global gig workers connecting worldwide" 
          className="w-full h-full object-cover opacity-15 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[700px] gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success/20 to-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6 border border-success/20 shadow-lg">
              <TrendingUp className="h-4 w-4 animate-pulse" />
              <span className="font-semibold">Over 50,000 international opportunities</span>
            </div>
            
            <h1 className="text-4xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find Your Next 
              <span className="block lg:inline bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse"> Global Career </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Connect with employers worldwide seeking skilled workers. From construction in Japan to delivery services in Europe - your next career move awaits.
            </p>

            {/* Search Form */}
            <div className="bg-card p-4 md:p-6 rounded-2xl shadow-lg border border-border max-w-2xl mx-auto lg:mx-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Job title or skill" 
                    className="pl-10 h-12"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select value={searchLocation} onValueChange={setSearchLocation}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="UAE">UAE</SelectItem>
                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                      <SelectItem value="Qatar">Qatar</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={searchCategory} onValueChange={setSearchCategory}>
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
              
              <Button 
                size="xl" 
                variant="hero" 
                className="w-full"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
                Search Global Jobs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-3 md:p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-xs text-muted-foreground font-medium">Active Jobs</div>
              </div>
              <div className="text-center p-3 md:p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform">
                <div className="text-2xl md:text-3xl font-bold text-secondary mb-1">32</div>
                <div className="text-xs text-muted-foreground font-medium">Countries</div>
              </div>
              <div className="text-center p-3 md:p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform">
                <div className="text-2xl md:text-3xl font-bold text-success mb-1">98%</div>
                <div className="text-xs text-muted-foreground font-medium">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="flex-1 lg:max-w-md animate-fade-in delay-300">
            <div className="space-y-4">
              <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Global Reach</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access opportunities in 32+ countries with the highest demand for skilled workers
                </p>
              </div>

              <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-3 rounded-xl">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Fast Track Hiring</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Countries with 1-4 week hiring times and simplified visa processes
                </p>
              </div>

              <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-success/20 to-success/10 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Verified Opportunities</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every job verified with transparent salaries and real employer reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Search Bar */}
      {isSticky && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-10 h-10"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button size="sm" className="h-10 px-4" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;