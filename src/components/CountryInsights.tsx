import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, MapPin, Clock, AlertCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CountryInsights = () => {
  const navigate = useNavigate();
  
  const countries = [
    {
      name: "Japan",
      flag: "🇯🇵",
      status: "High Demand",
      statusColor: "bg-destructive text-destructive-foreground",
      reason: "Aging workforce & infrastructure renewal",
      avgSalary: "₹2.75-3.30L",
      visaProcess: "Work visa (3-6 months)",
      languages: ["Japanese", "English"],
      topJobs: ["Construction", "Manufacturing", "Elderly Care"]
    },
    {
      name: "Germany",
      flag: "🇩🇪",
      status: "Very High",
      statusColor: "bg-destructive text-destructive-foreground",
      reason: "Green energy transition & skilled labor shortage",
      avgSalary: "₹3.00-3.55L",
      visaProcess: "EU Blue Card (2-4 months)",
      languages: ["German", "English"],
      topJobs: ["Renewable Energy", "Engineering", "Construction"]
    },
    {
      name: "UAE",
      flag: "🇦🇪",
      status: "High Demand",
      statusColor: "bg-warning text-warning-foreground",
      reason: "Expo legacy projects & Vision 2071 development",
      avgSalary: "₹2.20-3.00L",
      visaProcess: "Employer sponsored (1-3 months)",
      languages: ["Arabic", "English"],
      topJobs: ["Construction", "Hospitality", "Transportation"]
    },
    {
      name: "Saudi Arabia",
      flag: "🇸🇦",
      status: "Very High",
      statusColor: "bg-destructive text-destructive-foreground",
      reason: "Vision 2030 mega projects & NEOM development",
      avgSalary: "₹2.00-2.75L",
      visaProcess: "Work visa (2-4 months)",
      languages: ["Arabic", "English"],
      topJobs: ["Construction", "Oil & Gas", "Hospitality"]
    },
    {
      name: "Singapore",
      flag: "🇸🇬",
      status: "High Demand",
      statusColor: "bg-warning text-warning-foreground",
      reason: "Tech hub expansion & skilled trades shortage",
      avgSalary: "₹2.50-3.15L",
      visaProcess: "S Pass (2-4 weeks)",
      languages: ["English", "Mandarin", "Malay"],
      topJobs: ["Construction", "Manufacturing", "IT"]
    },
    {
      name: "Australia",
      flag: "🇦🇺",
      status: "High Demand",
      statusColor: "bg-warning text-warning-foreground",
      reason: "Mining boom & construction skills gap",
      avgSalary: "₹3.15-4.35L",
      visaProcess: "Skilled Worker Visa (3-6 months)",
      languages: ["English"],
      topJobs: ["Mining", "Construction", "Healthcare"]
    }
  ];

  const handleViewJobs = (countryName: string) => {
    navigate(`/jobs?location=${encodeURIComponent(countryName)}`);
  };

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary mb-4">
            <Globe className="h-3.5 w-3.5" />
            Market Intelligence
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold font-heading mb-5 tracking-tight">
            Country <span className="text-gradient">Insights</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Strategic insights into countries with the highest demand for skilled workers
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-12">
          {countries.map((country, index) => (
            <div
              key={index}
              className="group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
            >
              <Card 
                className="h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl cursor-pointer overflow-hidden flex flex-col"
                onClick={() => handleViewJobs(country.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{country.flag}</span>
                      <div>
                        <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
                          {country.name}
                        </CardTitle>
                        <Badge className={`${country.statusColor} mt-1 text-xs hover:opacity-80 transition-opacity`}>
                          {country.status}
                        </Badge>
                      </div>
                    </div>
                    <TrendingUp className={`h-5 w-5 text-success ${country.status.includes('Very High') ? 'animate-bounce' : ''}`} />
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col space-y-4">
                  {/* Why high demand */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground text-xs">Why High Demand?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{country.reason}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-success font-bold text-sm">₹</span>
                      <div>
                        <div className="text-xs font-medium text-foreground">{country.avgSalary}</div>
                        <div className="text-[10px] text-muted-foreground">Avg. Salary</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <div>
                        <div className="text-xs font-medium text-foreground line-clamp-1">{country.visaProcess}</div>
                        <div className="text-[10px] text-muted-foreground">Visa Process</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Jobs */}
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Top Categories
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {country.topJobs.map((job, jobIndex) => (
                        <Badge key={jobIndex} variant="secondary" className="text-xs bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                          {job}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex gap-1.5">
                    {country.languages.map((lang, langIndex) => (
                      <Badge key={langIndex} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1" />

                  <Button 
                    className="w-full rounded-xl group/btn flex items-center justify-center gap-2 mt-auto"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleViewJobs(country.name); }}
                  >
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>View {country.name} Jobs</span>
                    <ArrowRight className="h-4 w-4 shrink-0 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="rounded-xl px-8 shadow-primary hover:shadow-hover transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/jobs')}
          >
            <span>Explore All Countries</span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CountryInsights;