import { Search, FileText, CheckCircle, Video, Shield, Plane } from "lucide-react";

const ProcessTimeline = () => {
  const steps = [
    {
      number: 1,
      title: "Search Jobs",
      description: "Browse verified international opportunities",
      icon: Search,
      color: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      number: 2,
      title: "Apply",
      description: "Submit application with your documents",
      icon: FileText,
      color: "bg-secondary",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      number: 3,
      title: "Get Shortlisted",
      description: "Employers review qualified candidates",
      icon: CheckCircle,
      color: "bg-success",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      number: 4,
      title: "Interview",
      description: "Complete interviews and get offer",
      icon: Video,
      color: "bg-warning",
      iconBg: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      number: 5,
      title: "Visa Process",
      description: "Complete visa and ECR verification",
      icon: Shield,
      color: "bg-info",
      iconBg: "bg-info/10",
      iconColor: "text-info"
    },
    {
      number: 6,
      title: "Travel",
      description: "Start your new career abroad",
      icon: Plane,
      color: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mb-4 tracking-tight">
            Your Path to <span className="text-gradient">Global Success</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A simple, transparent process to help you land your dream job abroad
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(8.33%+24px)] right-[calc(8.33%+24px)] h-[2px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
          
          {/* Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step number circle */}
                <div className={`relative z-10 w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`mt-4 w-14 h-14 rounded-xl ${step.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="mt-4 font-semibold font-heading text-foreground text-sm lg:text-base">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs lg:text-sm text-muted-foreground leading-relaxed max-w-[160px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;