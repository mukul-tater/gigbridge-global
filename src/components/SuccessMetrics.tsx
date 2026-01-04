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
      gradient: "from-primary to-primary/70",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Users,
      label: "Workers Placed",
      value: counts.workersPlaced.toLocaleString(),
      suffix: "+",
      gradient: "from-secondary to-secondary/70",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: Globe,
      label: "Countries Covered",
      value: counts.countries.toLocaleString(),
      suffix: "",
      gradient: "from-success to-success/70",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      icon: TrendingUp,
      label: "Active Employers",
      value: counts.activeEmployers.toLocaleString(),
      suffix: "+",
      gradient: "from-info to-info/70",
      iconBg: "bg-info/10",
      iconColor: "text-info"
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold font-heading text-foreground mb-3">
            Trusted by <span className="text-gradient">Thousands</span> Worldwide
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join our growing community of workers finding opportunities across the globe
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className="relative h-full p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${metric.iconBg} mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <metric.icon className={`h-6 w-6 lg:h-7 lg:w-7 ${metric.iconColor}`} />
                </div>
                
                {/* Value */}
                <div className="text-3xl lg:text-4xl xl:text-5xl font-bold font-heading text-foreground mb-2 tracking-tight">
                  {metric.value}
                  <span className={`text-2xl lg:text-3xl ${metric.iconColor}`}>{metric.suffix}</span>
                </div>
                
                {/* Label */}
                <div className="text-sm lg:text-base text-muted-foreground font-medium">
                  {metric.label}
                </div>
                
                {/* Decorative corner */}
                <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;