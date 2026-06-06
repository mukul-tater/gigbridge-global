import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const destinations = [
  {
    flag: "🇦🇪",
    name: "UAE",
    demand: "High Demand",
    focus: "Construction, hospitality, logistics",
    note: "Active pilot market — Dubai & Abu Dhabi",
    search: "United Arab Emirates",
  },
  {
    flag: "🇴🇲",
    name: "Oman",
    demand: "High Demand",
    focus: "Construction, oil & gas, infrastructure",
    note: "Active pilot market",
    search: "Oman",
  },
  {
    flag: "🇸🇦",
    name: "Saudi Arabia",
    demand: "Very High",
    focus: "NEOM, construction, hospitality",
    note: "Vision 2030 mega projects",
    search: "Saudi Arabia",
  },
  {
    flag: "🇯🇵",
    name: "Japan",
    demand: "High Demand",
    focus: "Construction, manufacturing, care work",
    note: "3.4M workers needed by 2030",
    search: "Japan",
  },
  {
    flag: "🇩🇪",
    name: "Germany",
    demand: "Very High",
    focus: "Construction, renewable energy, engineering",
    note: "90,000 visas for Indian workers annually",
    search: "Germany",
  },
  {
    flag: "🇦🇺",
    name: "Australia",
    demand: "High Demand",
    focus: "Construction, mining, healthcare",
    note: "Skilled worker visa pathways",
    search: "Australia",
  },
];

export default function GlobalDestinations() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-info/10 text-info mb-3">
            Global Horizons
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight mb-3">
            Where Indian workers are{" "}
            <span className="text-gradient">in demand</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Key markets opening for skilled and blue-collar Indian talent — verified employers, compliant pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className="group rounded-xl border border-border/60 bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{dest.flag}</span>
                  <div>
                    <h3 className="font-semibold font-heading text-lg text-foreground">{dest.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1 bg-success/10 text-success border-success/20">
                      {dest.demand}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">Top sectors: </span>
                {dest.focus}
              </p>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {dest.note}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={() => navigate(`/jobs?location=${encodeURIComponent(dest.search)}`)}
              >
                View jobs in {dest.name}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
