import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Globe, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-workers.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DESTINATION_COUNTRIES, JOB_CATEGORIES } from "@/lib/constants";

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

  const trustBadges = [
    "Verified Employers",
    "Secure Process",
    "Visa Support"
  ];

  return (
    <section className="relative min-h-[750px] lg:min-h-[800px] overflow-hidden bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.03]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Global workers connecting worldwide" 
          className="w-full h-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-32 left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-32 right-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-soft animation-delay-500"></div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[750px] lg:min-h-[800px] gap-12 lg:gap-16 py-12">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left pt-8 lg:pt-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-8 border border-success/20 animate-fade-in">
              <TrendingUp className="h-4 w-4" />
              <span>Over 50,000 global opportunities</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading text-foreground mb-6 leading-[1.1] tracking-tight animate-fade-in animation-delay-150">
              Find Your Next
              <span className="block text-gradient">Global Career</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-300">
              Connect with employers worldwide seeking skilled workers. From construction to healthcare - your next career move awaits.
            </p>

            {/* Search Form */}
            <div className="bg-card p-4 lg:p-6 rounded-2xl shadow-elevated border border-border max-w-2xl mx-auto lg:mx-0 animate-fade-in animation-delay-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Job title or skill" 
                    className="pl-10 h-12 bg-background border-border focus:border-primary"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={searchLocation} onValueChange={setSearchLocation}>
                    <SelectTrigger className="pl-10 h-12 bg-background border-border">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {DESTINATION_COUNTRIES.filter(c => c !== 'All Countries').slice(0, 25).map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="h-12 bg-background border-border sm:col-span-2 lg:col-span-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {JOB_CATEGORIES.filter(c => c !== 'All Categories').map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                size="xl" 
                variant="hero" 
                className="w-full gap-2"
                onClick={handleSearch}
              >
                Search Jobs
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 animate-fade-in animation-delay-500">
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Stats & Feature Cards */}
          <div className="flex-1 w-full lg:max-w-md xl:max-w-lg">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in animation-delay-300">
              {[
                { value: "50K+", label: "Active Jobs", color: "text-primary" },
                { value: "50+", label: "Countries", color: "text-secondary" },
                { value: "98%", label: "Success Rate", color: "text-success" },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-card border border-border shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className={`text-2xl lg:text-3xl font-bold font-heading ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Access opportunities in 50+ countries with high demand for skilled workers",
                  color: "primary"
                },
                {
                  icon: MapPin,
                  title: "Fast Track Hiring",
                  description: "Countries with 1-4 week hiring times and simplified visa processes",
                  color: "secondary"
                },
                {
                  icon: TrendingUp,
                  title: "Verified Opportunities",
                  description: "Every job verified with transparent salaries and real employer reviews",
                  color: "success"
                }
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`card-professional p-5 hover:border-${feature.color}/30 animate-fade-in`}
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-${feature.color}/10 shrink-0`}>
                      <feature.icon className={`h-5 w-5 text-${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold font-heading text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Search Bar */}
      {isSticky && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-sm animate-fade-in">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-10 h-10 bg-background"
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