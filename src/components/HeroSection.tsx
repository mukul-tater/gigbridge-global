import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Globe, TrendingUp, ArrowRight, CheckCircle, Sparkles, Users, Shield } from "lucide-react";
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

  const stats = [
    { value: "50K+", label: "Active Jobs", icon: TrendingUp },
    { value: "50+", label: "Countries", icon: Globe },
    { value: "98%", label: "Success Rate", icon: CheckCircle },
  ];

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-info/[0.03]">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-mesh opacity-60" />
        
        {/* Hero image with modern overlay */}
        <img 
          src={heroImage} 
          alt="Global workers connecting worldwide" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.04] mix-blend-multiply"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute top-40 right-[10%] w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />
      <div className="absolute bottom-40 left-[20%] w-80 h-80 bg-secondary/8 rounded-full blur-3xl animate-pulse-soft animation-delay-1000" />
      
      {/* Floating geometric shapes */}
      <div className="hidden lg:block absolute top-32 right-[15%] w-20 h-20 border-2 border-primary/20 rounded-2xl rotate-12 animate-float" />
      <div className="hidden lg:block absolute bottom-48 left-[8%] w-16 h-16 border-2 border-secondary/20 rounded-full animate-float animation-delay-300" />
      <div className="hidden lg:block absolute top-1/2 right-[5%] w-12 h-12 bg-success/10 rounded-xl rotate-45 animate-float animation-delay-700" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[90vh] lg:min-h-screen gap-12 lg:gap-20 py-16 lg:py-0">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-info/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-primary/20 animate-fade-in backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-bounce-subtle" />
              <span>Over 50,000 global opportunities</span>
            </div>
            
            {/* Main Heading with gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading text-foreground mb-6 leading-[1.05] tracking-tight opacity-0 animate-fade-in-up animation-delay-100">
              Find Your Next
              <span className="block mt-2 text-gradient-animated bg-[length:200%_200%]">
                Global Career
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in-up animation-delay-200">
              Connect with verified employers worldwide seeking skilled workers. From construction to healthcare — your career without borders starts here.
            </p>

            {/* Search Form - Modern Glass Design */}
            <div className="glass-strong p-5 lg:p-6 rounded-2xl lg:rounded-3xl max-w-2xl mx-auto lg:mx-0 opacity-0 animate-fade-in-up animation-delay-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Job title or skill" 
                    className="pl-11 h-12 lg:h-14 bg-background/80 border-border/50 focus:border-primary focus:bg-background rounded-xl text-base"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
                  <Select value={searchLocation} onValueChange={setSearchLocation}>
                    <SelectTrigger className="pl-11 h-12 lg:h-14 bg-background/80 border-border/50 rounded-xl text-base">
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
                  <SelectTrigger className="h-12 lg:h-14 bg-background/80 border-border/50 rounded-xl sm:col-span-2 lg:col-span-1 text-base">
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
                size="lg" 
                className="w-full h-12 lg:h-14 gap-3 text-base font-semibold bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 rounded-xl shadow-primary transition-all duration-300 hover:shadow-hover hover:scale-[1.02]"
                onClick={handleSearch}
              >
                Search Jobs
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges - Enhanced */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 opacity-0 animate-fade-in-up animation-delay-400">
              {[
                { icon: Shield, text: "Verified Employers" },
                { icon: CheckCircle, text: "Secure Process" },
                { icon: Globe, text: "Visa Support" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-success/10">
                    <badge.icon className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Stats & Features */}
          <div className="flex-1 w-full lg:max-w-lg">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6 opacity-0 animate-slide-in-right animation-delay-300">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group relative text-center p-4 lg:p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl lg:text-3xl font-bold font-heading text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="space-y-4 stagger-children">
              {[
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Access opportunities in 50+ countries with high demand for skilled workers",
                  gradient: "from-primary/10 to-info/10",
                  iconBg: "bg-primary/15",
                  iconColor: "text-primary"
                },
                {
                  icon: TrendingUp,
                  title: "Fast Track Hiring",
                  description: "Countries with 1-4 week hiring times and simplified visa processes",
                  gradient: "from-secondary/10 to-warning/10",
                  iconBg: "bg-secondary/15",
                  iconColor: "text-secondary"
                },
                {
                  icon: Users,
                  title: "Verified Opportunities",
                  description: "Every job verified with transparent salaries and real employer reviews",
                  gradient: "from-success/10 to-info/10",
                  iconBg: "bg-success/15",
                  iconColor: "text-success"
                }
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className="group card-premium p-5 lg:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.iconBg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold font-heading text-foreground mb-1.5 text-lg">{feature.title}</h3>
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
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 glass-strong border-b border-border/50 animate-fade-in-down">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-10 h-11 bg-background/80 rounded-xl"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button size="sm" className="h-11 px-4 rounded-xl" onClick={handleSearch}>
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