import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, MapPin, DollarSign, Clock, AlertCircle } from "lucide-react";

const CountryInsights = () => {
  const countries = [
    {
      name: "Japan",
      flag: "🇯🇵",
      status: "High Demand",
      statusColor: "bg-red-50 text-red-700",
      reason: "Aging workforce & infrastructure renewal",
      avgSalary: "$3,500-4,200",
      visaProcess: "Work visa required (3-6 months)",
      languages: ["Japanese", "English (limited)"],
      topJobs: ["Construction", "Manufacturing", "Elderly Care"],
      culturalNote: "Emphasis on punctuality and respect for hierarchy"
    },
    {
      name: "Germany",
      flag: "🇩🇪",
      status: "Very High",
      statusColor: "bg-red-50 text-red-700",
      reason: "Green energy transition & skilled labor shortage",
      avgSalary: "$3,800-4,500",
      visaProcess: "EU Blue Card or work permit (2-4 months)",
      languages: ["German", "English"],
      topJobs: ["Renewable Energy", "Engineering", "Construction"],
      culturalNote: "Direct communication style, work-life balance important"
    },
    {
      name: "United Arab Emirates",
      flag: "🇦🇪",
      status: "High Demand",
      statusColor: "bg-orange-50 text-orange-700",
      reason: "Expo legacy projects & Vision 2071 development",
      avgSalary: "$2,800-3,800",
      visaProcess: "Work visa sponsored by employer (1-3 months)",
      languages: ["Arabic", "English"],
      topJobs: ["Construction", "Hospitality", "Transportation"],
      culturalNote: "Multicultural environment, respect for Islamic customs"
    },
    {
      name: "Norway",
      flag: "🇳🇴",
      status: "Medium-High",
      statusColor: "bg-yellow-50 text-yellow-700",
      reason: "Oil industry & renewable energy expansion",
      avgSalary: "$4,500-5,200",
      visaProcess: "Work permit required (2-6 months)",
      languages: ["Norwegian", "English"],
      topJobs: ["Oil & Gas", "Renewable Energy", "Maritime"],
      culturalNote: "Egalitarian society, outdoor lifestyle important"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Country Labor Market Insights
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Strategic insights into countries with the highest demand for skilled workers, 
            including visa requirements and cultural guidance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {countries.map((country, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <CardTitle className="text-xl">{country.name}</CardTitle>
                      <Badge className={`${country.statusColor} mt-1`}>
                        {country.status}
                      </Badge>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Why High Demand?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{country.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-sm font-medium">Avg. Salary</div>
                      <div className="text-xs text-muted-foreground">{country.avgSalary}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Visa Process</div>
                      <div className="text-xs text-muted-foreground">{country.visaProcess}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Top Job Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {country.topJobs.map((job, jobIndex) => (
                      <Badge key={jobIndex} variant="secondary" className="text-xs">
                        {job}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Languages</div>
                  <div className="flex gap-2">
                    {country.languages.map((lang, langIndex) => (
                      <Badge key={langIndex} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-1">Cultural Insight</div>
                  <p className="text-xs text-muted-foreground">{country.culturalNote}</p>
                </div>

                <Button variant="professional" className="w-full">
                  <MapPin className="h-4 w-4" />
                  View {country.name} Jobs
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Explore All Country Insights
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CountryInsights;