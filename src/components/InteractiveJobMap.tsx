import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, TrendingUp, Zap, CheckCircle, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InteractiveJobMap = () => {
  const navigate = useNavigate();
  
  const regions = [
    {
      name: "Eastern Europe",
      countries: ["Poland", "Czech Republic", "Romania"],
      jobs: "15,400+",
      avgSalary: "₹1.75-2.5L",
      easyHiring: true,
      hiringTime: "2-4 weeks",
      visaComplexity: "Simple",
      highlights: ["Fast work permits", "Minimal paperwork", "EU access"],
      topJobs: ["Manufacturing", "Logistics", "Construction"],
      gradient: "from-emerald-500 to-teal-600",
      searchCountry: "Poland"
    },
    {
      name: "Middle East",
      countries: ["UAE", "Saudi Arabia", "Qatar"],
      jobs: "22,800+",
      avgSalary: "₹2.2-3.5L",
      easyHiring: true,
      hiringTime: "1-3 weeks",
      visaComplexity: "Simple",
      highlights: ["Employer-sponsored visa", "Tax-free income", "Fast processing"],
      topJobs: ["Construction", "Hospitality", "Transportation"],
      gradient: "from-amber-500 to-orange-600",
      searchCountry: "United Arab Emirates"
    },
    {
      name: "Western Europe",
      countries: ["Germany", "Netherlands", "Belgium"],
      jobs: "18,900+",
      avgSalary: "₹2.75-3.8L",
      easyHiring: false,
      hiringTime: "2-6 months",
      visaComplexity: "Moderate",
      highlights: ["High salaries", "Great benefits", "Quality of life"],
      topJobs: ["Renewable Energy", "Engineering", "Healthcare"],
      gradient: "from-blue-500 to-indigo-600",
      searchCountry: "Germany"
    },
    {
      name: "East Asia",
      countries: ["Japan", "South Korea", "Singapore"],
      jobs: "16,200+",
      avgSalary: "₹2.5-3.5L",
      easyHiring: false,
      hiringTime: "3-6 months",
      visaComplexity: "Complex",
      highlights: ["Career growth", "Cultural experience", "Modern facilities"],
      topJobs: ["Manufacturing", "Construction", "Technology"],
      gradient: "from-purple-500 to-pink-600",
      searchCountry: "Japan"
    },
    {
      name: "Scandinavia",
      countries: ["Norway", "Sweden", "Denmark"],
      jobs: "8,500+",
      avgSalary: "₹3.15-4.3L",
      easyHiring: false,
      hiringTime: "2-6 months",
      visaComplexity: "Moderate",
      highlights: ["Highest salaries", "Work-life balance", "Social benefits"],
      topJobs: ["Oil & Gas", "Renewable Energy", "Maritime"],
      gradient: "from-cyan-500 to-blue-600",
      searchCountry: "Norway"
    },
    {
      name: "Southeast Asia",
      countries: ["Malaysia", "Thailand", "Vietnam"],
      jobs: "12,300+",
      avgSalary: "₹1.4-2.2L",
      easyHiring: true,
      hiringTime: "2-4 weeks",
      visaComplexity: "Simple",
      highlights: ["Low cost of living", "Quick hiring", "Growing markets"],
      topJobs: ["Manufacturing", "Hospitality", "Agriculture"],
      gradient: "from-teal-500 to-green-600",
      searchCountry: "Malaysia"
    }
  ];

  const handleExploreRegion = (searchCountry: string) => {
    navigate(`/jobs?location=${encodeURIComponent(searchCountry)}`);
  };

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-info/10 text-info mb-4">
            <MapPin className="h-3.5 w-3.5" />
            Global Opportunities
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold font-heading mb-5 tracking-tight">
            Explore Jobs by <span className="text-gradient">Region</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Discover opportunities with salary insights and hiring timelines
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Badge className="bg-success text-white border-0 px-3 py-1.5 shadow-md hover:bg-success/80 transition-colors cursor-default">
              <Zap className="h-3 w-3 mr-1.5" />
              Fast Hiring: 1-4 weeks
            </Badge>
            <Badge className="bg-warning text-white border-0 px-3 py-1.5 shadow-md hover:bg-warning/80 transition-colors cursor-default">
              <Clock className="h-3 w-3 mr-1.5" />
              Moderate: 2-6 months
            </Badge>
          </div>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {regions.map((region, index) => (
            <div
              key={index}
              className="group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <Card 
                className={`h-full relative overflow-hidden bg-card border-2 transition-all duration-500 hover:shadow-xl cursor-pointer ${
                  region.easyHiring ? 'border-success/30 hover:border-success/50' : 'border-border/50 hover:border-primary/30'
                }`}
                onClick={() => handleExploreRegion(region.searchCountry)}
              >
                
                {/* Gradient accent */}
                <div className={`h-1.5 bg-gradient-to-r ${region.gradient}`} />
                
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                      <h3 className="text-xl font-bold font-heading text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {region.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {region.countries.join(" • ")}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${region.gradient} group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Fast hiring badge */}
                  {region.easyHiring && (
                    <div className="mb-4">
                      <Badge className="bg-success text-white border-0 shadow-md hover:bg-success/80 transition-colors">
                        <Zap className="h-3 w-3 mr-1" />
                        Fast Hiring
                      </Badge>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Jobs</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">{region.jobs}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-1.5 text-success mb-1">
                        <span className="text-xs font-medium">₹ Salary</span>
                      </div>
                      <div className="text-sm font-bold text-foreground">{region.avgSalary}</div>
                    </div>
                  </div>

                  {/* Hiring info */}
                  <div className="space-y-2 mb-5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hiring Time</span>
                      <span className={`font-semibold ${region.easyHiring ? 'text-success' : 'text-warning'}`}>
                        {region.hiringTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Visa Process</span>
                      <span className={`font-semibold ${
                        region.visaComplexity === 'Simple' ? 'text-success' : 
                        region.visaComplexity === 'Moderate' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {region.visaComplexity}
                      </span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-5">
                    <div className="space-y-1.5">
                      {region.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top jobs */}
                  <div className="mb-5">
                    <div className="flex flex-wrap gap-1.5">
                      {region.topJobs.map((job, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                          {job}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-xl group/btn flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); handleExploreRegion(region.searchCountry); }}
                  >
                    <span>Explore {region.name}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveJobMap;