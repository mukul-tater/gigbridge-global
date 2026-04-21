import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Globe, TrendingUp, ArrowRight, CheckCircle, Sparkles, Users, Shield, Phone } from "lucide-react";
import SalaryProtectionPromise from "@/components/SalaryProtectionPromise";
import heroImage from "@/assets/hero-workers.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DESTINATION_COUNTRIES, JOB_CATEGORIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

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

  const [jobCount, setJobCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [jobRes, countryRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('jobs').select('country').eq('status', 'ACTIVE'),
      ]);
      if (jobRes.count != null) setJobCount(jobRes.count);
      if (countryRes.data) {
        const unique = new Set(countryRes.data.map((r: any) => r.country));
        setCountryCount(unique.size);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { value: jobCount > 0 ? `${jobCount.toLocaleString()}+` : '…', label: "Active Jobs", icon: TrendingUp },
    { value: countryCount > 0 ? `${countryCount}+` : '…', label: "Countries", icon: Globe },
    { value: "98%", label: "Success Rate", icon: CheckCircle },
  ];

  return (
    <section className="relative min-h-[80vh] lg:min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-info/[0.03]">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <img
          src={heroImage}
          alt="Global workers connecting worldwide"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.04] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>

      {/* Decorative blobs - hidden on small screens */}
      <div className="hidden sm:block absolute top-20 left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="hidden sm:block absolute top-40 right-[10%] w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[80vh] lg:min-h-screen gap-8 lg:gap-16 py-12 lg:py-0">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl w-full">
            {/* Hero highlight banner — primary value prop */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success/15 via-primary/15 to-info/15 text-foreground px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-5 border-2 border-primary/30 shadow-primary/20 shadow-lg animate-fade-in backdrop-blur-sm">
              <Shield className="h-4 w-4 text-success animate-pulse-soft" />
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Get a safe foreign job — without agents
              </span>
            </div>

            {/* Secondary trust badge */}
            <div className="inline-flex items-center gap-2 bg-muted/50 text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium mb-6 border border-border/50 animate-fade-in">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>900+ verified jobs · 40+ countries</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-heading text-foreground mb-5 leading-[1.1] tracking-tight opacity-0 animate-fade-in-up animation-delay-100">
              Find Foreign
              <span className="block mt-1 text-gradient-animated bg-[length:200%_200%]">
                Jobs Abroad
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-muted-foreground mb-4 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in-up animation-delay-200">
              No agent fees. Verified jobs only. Connect directly with employers worldwide.
            </p>

            {/* Primary CTA — Find Foreign Jobs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 opacity-0 animate-fade-in-up animation-delay-200">
              <Button
                size="lg"
                className="h-12 px-6 gap-2 text-base font-semibold bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 rounded-xl shadow-primary"
                onClick={() => navigate('/jobs')}
              >
                Find Foreign Jobs <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-6 gap-2 text-base font-semibold rounded-xl"
                onClick={() => navigate('/employer/quick-signup')}
              >
                <Users className="h-5 w-5" /> Hire Workers
              </Button>
            </div>
            <div className="-mt-4 mb-6 flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-2 sm:gap-3 text-xs text-muted-foreground">
              <span>Employers: Hire verified workers at just 1% cost — no upfront fees.</span>
              <a
                href="tel:+919950085843"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Phone className="h-3 w-3" />
                Call us: +91-9950085843
              </a>
            </div>

            {/* Search Form */}
            <div className="glass-strong p-4 sm:p-5 rounded-2xl max-w-2xl mx-auto lg:mx-0 opacity-0 animate-fade-in-up animation-delay-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Job title or skill"
                    className="pl-10 h-11 sm:h-12 bg-background/80 border-border/50 focus:border-primary focus:bg-background rounded-xl text-sm sm:text-base"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
                  <Select value={searchLocation} onValueChange={setSearchLocation}>
                    <SelectTrigger className="pl-10 h-11 sm:h-12 bg-background/80 border-border/50 rounded-xl text-sm sm:text-base">
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
                  <SelectTrigger className="h-11 sm:h-12 bg-background/80 border-border/50 rounded-xl sm:col-span-2 lg:col-span-1 text-sm sm:text-base">
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
                className="w-full h-11 sm:h-12 gap-2 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 rounded-xl shadow-primary transition-all duration-300 hover:shadow-hover"
                onClick={handleSearch}
              >
                Search Jobs
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 opacity-0 animate-fade-in-up animation-delay-400">
              {[
                { icon: Shield, text: "Verified Employers" },
                { icon: CheckCircle, text: "Secure Process" },
                { icon: Globe, text: "Visa Support" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-success/10">
                    <badge.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success" />
                  </div>
                  <span className="font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hidden on small mobile, visible from sm up */}
          <div className="flex-1 w-full lg:max-w-lg hidden sm:block">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5 opacity-0 animate-slide-in-right animation-delay-300">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="group relative text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto mb-1.5" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              {/* Plain-language salary protection — primary trust driver */}
              <SalaryProtectionPromise variant="hero" />

              {[
                {
                  icon: Globe,
                  title: "Global Reach",
                  description: "Access opportunities in 50+ countries with high demand for skilled workers",
                  iconBg: "bg-primary/15",
                  iconColor: "text-primary"
                },
                {
                  icon: TrendingUp,
                  title: "Fast Track Hiring",
                  description: "Countries with 1-4 week hiring times and simplified visa processes",
                  iconBg: "bg-secondary/15",
                  iconColor: "text-secondary"
                }
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group card-premium p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl ${feature.iconBg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold font-heading text-foreground mb-1 text-base sm:text-lg">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
