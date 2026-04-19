import ResourcePageLayout from "@/components/ResourcePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const countries = [
  {
    flag: "🇦🇪",
    name: "United Arab Emirates",
    demand: "Very High",
    avgSalary: "₹70k – ₹1.4L/mo",
    sectors: ["Construction", "Hospitality", "Healthcare", "Retail"],
    highlight: "Largest Indian workforce abroad — 3.5M+ Indians live & work here.",
  },
  {
    flag: "🇸🇦",
    name: "Saudi Arabia",
    demand: "High",
    avgSalary: "₹65k – ₹1.3L/mo",
    sectors: ["Construction", "Oil & Gas", "Healthcare", "Logistics"],
    highlight: "Vision 2030 mega-projects (NEOM, Red Sea) creating record demand.",
  },
  {
    flag: "🇶🇦",
    name: "Qatar",
    demand: "Steady",
    avgSalary: "₹70k – ₹1.5L/mo",
    sectors: ["Construction", "Hospitality", "Drivers", "Healthcare"],
    highlight: "Post-FIFA infrastructure boom continues with new metro & airport phases.",
  },
  {
    flag: "🇩🇪",
    name: "Germany",
    demand: "Very High (skilled)",
    avgSalary: "₹1.8L – ₹3.5L/mo",
    sectors: ["Healthcare", "Engineering", "IT", "Skilled trades"],
    highlight: "Skilled Workers Act + acute labour shortage = fast-track visas.",
  },
  {
    flag: "🇸🇬",
    name: "Singapore",
    demand: "High (technical)",
    avgSalary: "₹1L – ₹1.8L/mo",
    sectors: ["Construction", "Marine", "F&B", "Logistics"],
    highlight: "Stable, English-speaking, transparent rules — but quotas apply per employer.",
  },
  {
    flag: "🇨🇦",
    name: "Canada",
    demand: "High (PR pathway)",
    avgSalary: "₹1.6L – ₹2.8L/mo",
    sectors: ["Healthcare", "Trucking", "Construction", "Caregiving"],
    highlight: "Direct PR pathway via Express Entry / Provincial Nominee Programs.",
  },
];

export default function CountryInsightsPage() {
  return (
    <ResourcePageLayout
      title="Country Insights for Overseas Workers | SafeWorkGlobal"
      description="Explore demand, salaries and key sectors in the top countries hiring Indian workers."
      eyebrow="Country Insights"
      heading="Where the jobs are"
      intro="An at-a-glance comparison of the six countries that hire the most workers through SafeWorkGlobal."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {countries.map((c) => (
          <Card key={c.name} className="hover:shadow-lg hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl" aria-hidden>{c.flag}</span>
                <Badge className="bg-success/10 text-success border-success/20">
                  <TrendingUp className="h-3 w-3 mr-1" /> {c.demand}
                </Badge>
              </div>
              <h3 className="text-lg font-heading font-bold mb-2">{c.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{c.highlight}</p>

              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{c.avgSalary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.sectors.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 text-center">
        <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold mb-1">Verified employers, verified jobs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Every job on SafeWorkGlobal goes through company-registration and contract checks.
        </p>
        <Link to="/jobs">
          <Button size="lg" className="rounded-xl">
            Browse jobs by country <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </ResourcePageLayout>
  );
}
