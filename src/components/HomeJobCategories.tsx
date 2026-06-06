import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  HardHat,
  Zap,
  Flame,
  Wrench,
  Factory,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const categories: {
  icon: LucideIcon;
  title: string;
  description: string;
  demand: string;
  countries: string;
}[] = [
  {
    icon: HardHat,
    title: "Construction",
    description: "Infrastructure, residential & commercial building",
    demand: "High",
    countries: "UAE, Saudi Arabia, Japan",
  },
  {
    icon: Zap,
    title: "Electrical",
    description: "Industrial electrical & renewable energy projects",
    demand: "Very High",
    countries: "Germany, UAE, Australia",
  },
  {
    icon: Flame,
    title: "Welding",
    description: "Pipeline, shipbuilding & heavy industry",
    demand: "High",
    countries: "Qatar, Kuwait, Oman",
  },
  {
    icon: Wrench,
    title: "Plumbing",
    description: "Residential & commercial plumbing systems",
    demand: "Medium",
    countries: "UK, Australia, New Zealand",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    description: "Assembly, quality control & machine operation",
    demand: "High",
    countries: "Japan, Poland, Malaysia",
  },
  {
    icon: Truck,
    title: "Logistics",
    description: "Delivery, freight & supply chain operations",
    demand: "Very High",
    countries: "UAE, Germany, Netherlands",
  },
];

export default function HomeJobCategories() {
  const navigate = useNavigate();

  const demandClass = (demand: string) => {
    if (demand === "Very High") return "text-destructive bg-destructive/10";
    if (demand === "High") return "text-success bg-success/10";
    return "text-warning bg-warning/10";
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight mb-3">
            Browse by <span className="text-gradient">skill</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            High-demand trades for Indian workers abroad — search verified openings in your field.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {categories.map((cat) => (
            <Card
              key={cat.title}
              className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.title)}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <cat.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold font-heading text-foreground">{cat.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${demandClass(cat.demand)}`}>
                      {cat.demand} demand
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                <p className="text-xs text-muted-foreground">
                  Popular in: <span className="text-foreground">{cat.countries}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/jobs">
            <Button size="lg" variant="outline" className="rounded-xl gap-2">
              Explore all categories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
