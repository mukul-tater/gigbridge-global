import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, Globe, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SuccessMetrics = () => {
  const [counts, setCounts] = useState({
    jobsFilled: 0,
    workersPlaced: 0,
    countries: 0,
    activeEmployers: 0
  });
  const [finalCounts, setFinalCounts] = useState({
    jobsFilled: 0,
    workersPlaced: 0,
    countries: 0,
    activeEmployers: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const [jobsRes, countriesRes, workersRes, employersRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('jobs').select('country').eq('status', 'ACTIVE'),
        supabase.from('worker_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('employer_profiles').select('id', { count: 'exact', head: true }),
      ]);

      const uniqueCountries = countriesRes.data
        ? new Set(countriesRes.data.map((r: any) => r.country)).size
        : 0;

      setFinalCounts({
        jobsFilled: jobsRes.count ?? 0,
        workersPlaced: workersRes.count ?? 0,
        countries: uniqueCountries,
        activeEmployers: employersRes.count ?? 0
      });
      setDataLoaded(true);
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounts();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, dataLoaded]);

  const animateCounts = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounts({
        jobsFilled: Math.floor(finalCounts.jobsFilled * easeOutQuart),
        workersPlaced: Math.floor(finalCounts.workersPlaced * easeOutQuart),
        countries: Math.floor(finalCounts.countries * easeOutQuart),
        activeEmployers: Math.floor(finalCounts.activeEmployers * easeOutQuart)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(finalCounts);
      }
    }, interval);
  };

  const metrics = [
    {
      icon: Briefcase,
      label: "Jobs Filled",
      value: counts.jobsFilled.toLocaleString(),
      suffix: "+",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Users,
      label: "Workers Placed",
      value: counts.workersPlaced.toLocaleString(),
      suffix: "+",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: Globe,
      label: "Countries Covered",
      value: counts.countries.toLocaleString(),
      suffix: "",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      icon: TrendingUp,
      label: "Active Employers",
      value: counts.activeEmployers.toLocaleString(),
      suffix: "+",
      iconBg: "bg-info/10",
      iconColor: "text-info"
    }
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-2 sm:mb-3">
            Trusted by <span className="text-gradient">Thousands</span> Worldwide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Join our growing community of workers finding opportunities across the globe
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="group relative">
              <div className="relative h-full p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg overflow-hidden">
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl ${metric.iconBg} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${metric.iconColor}`} />
                </div>

                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-heading text-foreground mb-1 sm:mb-2 tracking-tight tabular-nums">
                  {metric.value}
                  <span className={`text-lg sm:text-2xl lg:text-3xl ${metric.iconColor}`}>{metric.suffix}</span>
                </div>

                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">
                  {metric.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;
