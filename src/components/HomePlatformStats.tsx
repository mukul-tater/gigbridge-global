import { Briefcase, Globe } from "lucide-react";

const STATS = [
  { icon: Briefcase, value: "1000+", label: "Verified jobs" },
  { icon: Globe, value: "50+", label: "Countries" },
];

export default function HomePlatformStats() {
  return (
    <section className="border-y border-border/60 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-xl mx-auto">
          {STATS.map((item) => (
            <div key={item.label} className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="shrink-0 p-3 rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
