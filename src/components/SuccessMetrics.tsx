import { useEffect, useState } from "react";
import { TrendingUp, Users, Globe, Briefcase } from "lucide-react";

const SuccessMetrics = () => {
  const [counts, setCounts] = useState({
    jobsFilled: 0,
    workersPlaced: 0,
    countries: 0,
    activeEmployers: 0
  });

  const finalCounts = {
    jobsFilled: 28450,
    workersPlaced: 24380,
    countries: 32,
    activeEmployers: 1240
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounts({
        jobsFilled: Math.floor(finalCounts.jobsFilled * progress),
        workersPlaced: Math.floor(finalCounts.workersPlaced * progress),
        countries: Math.floor(finalCounts.countries * progress),
        activeEmployers: Math.floor(finalCounts.activeEmployers * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(finalCounts);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const metrics = [
    {
      icon: Briefcase,
      label: "Jobs Filled",
      value: counts.jobsFilled.toLocaleString(),
      suffix: "+",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      label: "Workers Placed",
      value: counts.workersPlaced.toLocaleString(),
      suffix: "+",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Globe,
      label: "Countries Covered",
      value: counts.countries.toLocaleString(),
      suffix: "",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: TrendingUp,
      label: "Active Employers",
      value: counts.activeEmployers.toLocaleString(),
      suffix: "+",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${metric.bgColor} mb-4`}>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
              <div className={`text-4xl lg:text-5xl font-bold mb-2 ${metric.color}`}>
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
