import { Search, FileText, CheckCircle, Video, Shield, Plane } from "lucide-react";

const ProcessTimeline = () => {
  const steps = [
    {
      number: 1,
      title: "Search Jobs",
      description: "Browse verified international opportunities",
      icon: Search,
      gradient: "from-primary to-primary/70",
      bgColor: "bg-primary"
    },
    {
      number: 2,
      title: "Apply",
      description: "Submit application with your documents",
      icon: FileText,
      gradient: "from-secondary to-secondary/70",
      bgColor: "bg-secondary"
    },
    {
      number: 3,
      title: "Get Shortlisted",
      description: "Employers review qualified candidates",
      icon: CheckCircle,
      gradient: "from-success to-success/70",
      bgColor: "bg-success"
    },
    {
      number: 4,
      title: "Interview",
      description: "Complete interviews and get offer",
      icon: Video,
      gradient: "from-warning to-warning/70",
      bgColor: "bg-warning"
    },
    {
      number: 5,
      title: "Visa Process",
      description: "Complete visa and ECR verification",
      icon: Shield,
      gradient: "from-info to-info/70",
      bgColor: "bg-info"
    },
    {
      number: 6,
      title: "Travel",
      description: "Start your new career abroad",
      icon: Plane,
      gradient: "from-primary to-info",
      bgColor: "bg-gradient-to-r from-primary to-info"
    }
  ];

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary mb-4">
            How it Works
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold font-heading mb-5 tracking-tight">
            Your Path to <span className="text-gradient">Global Success</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple, transparent 6-step process to help you land your dream job abroad
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[60px] left-[calc(8.33%+28px)] right-[calc(8.33%+28px)] h-[3px]">
            <div className="w-full h-full bg-gradient-to-r from-primary via-success via-50% to-info rounded-full opacity-20" />
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary via-success via-50% to-info rounded-full opacity-40 blur-sm" />
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative flex flex-col items-center text-center group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Step number circle with glow */}
                <div className="relative mb-5">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 ${step.bgColor} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-150`} />
                  
                  {/* Circle */}
                  <div className={`relative z-10 w-14 h-14 lg:w-16 lg:h-16 rounded-full ${step.bgColor} flex items-center justify-center font-bold text-xl lg:text-2xl text-white shadow-lg group-hover:scale-110 transition-all duration-500`}>
                    {step.number}
                  </div>
                </div>
                
                {/* Icon Card */}
                <div className="w-full p-4 lg:p-5 rounded-2xl bg-card border border-border/50 group-hover:border-primary/30 group-hover:shadow-lg transition-all duration-500 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} bg-opacity-10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-semibold font-heading text-foreground text-base lg:text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed max-w-[160px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-16 lg:mt-20">
          <p className="text-muted-foreground text-sm">
            Ready to start your journey? 
            <span className="text-primary font-medium ml-1">Search jobs above</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;