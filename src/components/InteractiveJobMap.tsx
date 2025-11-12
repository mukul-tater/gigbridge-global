import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, TrendingUp, Zap, CheckCircle, Briefcase } from "lucide-react";

const InteractiveJobMap = () => {
  const regions = [
    {
      name: "Eastern Europe",
      countries: ["Poland", "Czech Republic", "Romania"],
      jobs: "15,400+",
      avgSalary: "$2,200-3,200",
      easyHiring: true,
      hiringTime: "2-4 weeks",
      visaComplexity: "Simple",
      highlights: ["Fast work permits", "Minimal paperwork", "EU access"],
      topJobs: ["Manufacturing", "Logistics", "Construction"],
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Middle East",
      countries: ["UAE", "Saudi Arabia", "Qatar"],
      jobs: "22,800+",
      avgSalary: "$2,800-4,500",
      easyHiring: true,
      hiringTime: "1-3 weeks",
      visaComplexity: "Simple",
      highlights: ["Employer-sponsored visa", "Tax-free income", "Fast processing"],
      topJobs: ["Construction", "Hospitality", "Transportation"],
      color: "from-amber-500 to-orange-600"
    },
    {
      name: "Western Europe",
      countries: ["Germany", "Netherlands", "Belgium"],
      jobs: "18,900+",
      avgSalary: "$3,500-4,800",
      easyHiring: false,
      hiringTime: "2-6 months",
      visaComplexity: "Moderate",
      highlights: ["High salaries", "Great benefits", "Quality of life"],
      topJobs: ["Renewable Energy", "Engineering", "Healthcare"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "East Asia",
      countries: ["Japan", "South Korea", "Singapore"],
      jobs: "16,200+",
      avgSalary: "$3,200-4,500",
      easyHiring: false,
      hiringTime: "3-6 months",
      visaComplexity: "Complex",
      highlights: ["Career growth", "Cultural experience", "Modern facilities"],
      topJobs: ["Manufacturing", "Construction", "Technology"],
      color: "from-purple-500 to-pink-600"
    },
    {
      name: "Scandinavia",
      countries: ["Norway", "Sweden", "Denmark"],
      jobs: "8,500+",
      avgSalary: "$4,000-5,500",
      easyHiring: false,
      hiringTime: "2-6 months",
      visaComplexity: "Moderate",
      highlights: ["Highest salaries", "Work-life balance", "Social benefits"],
      topJobs: ["Oil & Gas", "Renewable Energy", "Maritime"],
      color: "from-cyan-500 to-blue-600"
    },
    {
      name: "Southeast Asia",
      countries: ["Malaysia", "Thailand", "Vietnam"],
      jobs: "12,300+",
      avgSalary: "$1,800-2,800",
      easyHiring: true,
      hiringTime: "2-4 weeks",
      visaComplexity: "Simple",
      highlights: ["Low cost of living", "Quick hiring", "Growing markets"],
      topJobs: ["Manufacturing", "Hospitality", "Agriculture"],
      color: "from-teal-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Global Opportunities Map
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Explore job opportunities by region with salary insights and hiring timelines
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-success/10 text-success border-success/20">
              <Zap className="h-3 w-3 mr-1" />
              Fast Hiring: 1-4 weeks
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Clock className="h-3 w-3 mr-1" />
              Moderate: 2-6 months
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 ${
                region.easyHiring ? 'border-success/50' : 'border-border'
              }`}
            >
              {region.easyHiring && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-success text-success-foreground shadow-lg">
                    <Zap className="h-3 w-3 mr-1" />
                    Fast Hiring
                  </Badge>
                </div>
              )}
              
              <div className={`h-2 bg-gradient-to-r ${region.color}`} />
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{region.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {region.countries.join(" • ")}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${region.color}`}>
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 text-primary mb-1">
                      <Briefcase className="h-3 w-3" />
                      <span className="text-xs font-medium">Available Jobs</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{region.jobs}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 text-success mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs font-medium">Avg Salary</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">{region.avgSalary}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hiring Time:</span>
                    <span className={`text-sm font-semibold ${region.easyHiring ? 'text-success' : 'text-warning'}`}>
                      {region.hiringTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Visa Process:</span>
                    <span className={`text-sm font-semibold ${
                      region.visaComplexity === 'Simple' ? 'text-success' : 
                      region.visaComplexity === 'Moderate' ? 'text-warning' : 'text-destructive'
                    }`}>
                      {region.visaComplexity}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-foreground mb-2">Key Highlights:</div>
                  <div className="space-y-1">
                    {region.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-success" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-foreground mb-2">Top Job Categories:</div>
                  <div className="flex flex-wrap gap-2">
                    {region.topJobs.map((job, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {job}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="professional" className="w-full">
                  <TrendingUp className="h-4 w-4" />
                  Explore {region.name} Jobs
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveJobMap;
