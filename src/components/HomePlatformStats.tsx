import { useEffect, useState } from "react";
import { Briefcase, Users, Globe, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function HomePlatformStats() {
  const [stats, setStats] = useState({
    jobs: 0,
    workers: 0,
    countries: 0,
    employers: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [jobsRes, workersRes, countriesRes, employersRes] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
        supabase.from("worker_profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("country").eq("status", "ACTIVE"),
        supabase.from("employer_profiles").select("id", { count: "exact", head: true }),
      ]);

      const uniqueCountries = countriesRes.data
        ? new Set(countriesRes.data.map((r: { country: string }) => r.country)).size
        : 0;

      setStats({
        jobs: jobsRes.count ?? 0,
        workers: workersRes.count ?? 0,
        countries: uniqueCountries,
        employers: employersRes.count ?? 0,
      });
    };
    load();
  }, []);

  const items = [
    { icon: Briefcase, label: "Verified jobs live", value: stats.jobs, suffix: stats.jobs > 0 ? "+" : "" },
    { icon: Users, label: "Workers registered", value: stats.workers, suffix: stats.workers > 0 ? "+" : "" },
    { icon: Globe, label: "Countries hiring", value: stats.countries, suffix: stats.countries > 0 ? "+" : "" },
    { icon: Percent, label: "Platform fee", value: "1", suffix: "%", static: true },
  ];

  return (
    <section className="border-y border-border/60 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-foreground">
                  {item.static ? item.value : item.value.toLocaleString()}
                  <span className="text-lg text-primary">{item.suffix}</span>
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
