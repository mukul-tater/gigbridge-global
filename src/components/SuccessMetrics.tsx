import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, Globe, Briefcase } from "lucide-react";

const SuccessMetrics = () => {
  const [counts, setCounts] = useState({
    jobsFilled: 0,
    workersPlaced: 0,
    countries: 0,
    activeEmployers: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const finalCounts = {
    jobsFilled: 28450,
    workersPlaced: 24380,
    countries: 32,
    activeEmployers: 1240
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounts();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

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
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      icon: Users,
      label: "Workers Placed",
      value: counts.workersPlaced.toLocaleString(),
      suffix: "+",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20"
    },
    {
      icon: Globe,
      label: "Countries Covered",
      value: counts.countries.toLocaleString(),
      suffix: "",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20"
    },
    {
      icon: TrendingUp,
      label: "Active Employers",
      value: counts.activeEmployers.toLocaleString(),
      suffix: "+",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20"
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={`text-center p-6 rounded-2xl bg-background border ${metric.borderColor} hover:shadow-sm transition-all duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${metric.bgColor} mb-4`}>
                <metric.icon className={`h-7 w-7 ${metric.color}`} />
              </div>
              <div className={`text-3xl lg:text-4xl font-bold font-heading mb-2 ${metric.color}`}>
                {metric.value}{metric.suffix}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;