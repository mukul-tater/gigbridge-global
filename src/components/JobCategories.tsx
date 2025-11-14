import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Wrench, Zap, Flame, Droplets, Truck, Building } from "lucide-react";
import constructionIcon from "@/assets/construction-icon.png";
import electricianIcon from "@/assets/electrician-icon.png";
import welderIcon from "@/assets/welder-icon.png";
import { Link } from "react-router-dom";

const JobCategories = () => {
  const categories = [
    {
      icon: constructionIcon,
      title: "Construction",
      jobs: "12,847",
      avgSalary: "$3,200/month",
      description: "Infrastructure projects, residential and commercial building",
      demand: "High",
      countries: ["Japan", "Germany", "UAE"]
    },
    {
      icon: electricianIcon,
      title: "Electrical",
      jobs: "8,234",
      avgSalary: "$3,800/month",
      description: "Industrial electrical work, renewable energy projects",
      demand: "Very High",
      countries: ["Norway", "Australia", "Canada"]
    },
    {
      icon: welderIcon,
      title: "Welding",
      jobs: "6,521",
      avgSalary: "$4,100/month",
      description: "Pipeline, shipbuilding, and heavy industry welding",
      demand: "High",
      countries: ["Qatar", "Russia", "South Korea"]
    },
    {
      icon: "🔧",
      title: "Plumbing",
      jobs: "5,432",
      avgSalary: "$2,900/month",
      description: "Residential and commercial plumbing systems",
      demand: "Medium",
      countries: ["UK", "Ireland", "New Zealand"]
    },
    {
      icon: "🚚",
      title: "Delivery & Logistics",
      jobs: "15,678",
      avgSalary: "$2,400/month",
      description: "Package delivery, freight, and supply chain",
      demand: "Very High",
      countries: ["Netherlands", "Belgium", "Denmark"]
    },
    {
      icon: "🏭",
      title: "Manufacturing",
      jobs: "9,876",
      avgSalary: "$3,000/month",
      description: "Assembly line, quality control, machine operation",
      demand: "High",
      countries: ["Czech Republic", "Poland", "Slovakia"]
    }
  ];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "Very High":
        return "text-red-600 bg-red-50";
      case "High":
        return "text-success bg-success/10";
      case "Medium":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Popular Job Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore high-demand positions across various industries worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <Link key={index} to={`/jobs?category=${encodeURIComponent(category.title)}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-border cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {typeof category.icon === 'string' && category.icon.startsWith('/') ? (
                      <img src={category.icon} alt={category.title} className="h-12 w-12" />
                    ) : typeof category.icon === 'string' ? (
                      <div className="text-3xl">{category.icon}</div>
                    ) : (
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{category.jobs} jobs</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(category.demand)}`}>
                          {category.demand} Demand
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-foreground">{category.avgSalary}</div>
                      <div className="text-xs text-muted-foreground">Average salary</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">Top Markets:</div>
                      <div className="text-xs text-muted-foreground">
                        {category.countries.join(", ")}
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="professional" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    View {category.title} Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JobCategories;