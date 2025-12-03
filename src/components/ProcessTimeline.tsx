import { Search, FileText, CheckCircle, Video, Shield, Plane } from "lucide-react";

const ProcessTimeline = () => {
  const steps = [
    {
      number: 1,
      title: "Search Jobs",
      description: "Browse thousands of verified international job opportunities",
      icon: Search,
      color: "bg-primary text-primary-foreground",
      iconBg: "bg-primary/10"
    },
    {
      number: 2,
      title: "Apply for Job",
      description: "Submit your application with profile and documents",
      icon: FileText,
      color: "bg-secondary text-secondary-foreground",
      iconBg: "bg-secondary/10"
    },
    {
      number: 3,
      title: "Get Shortlisted",
      description: "Employers review and shortlist qualified candidates",
      icon: CheckCircle,
      color: "bg-success text-success-foreground",
      iconBg: "bg-success/10"
    },
    {
      number: 4,
      title: "Interview & Selection",
      description: "Complete interviews and receive your job offer",
      icon: Video,
      color: "bg-warning text-warning-foreground",
      iconBg: "bg-warning/10"
    },
    {
      number: 5,
      title: "Visa & ECR Process",
      description: "Complete visa approval and ECR verification",
      icon: Shield,
      color: "bg-info text-info-foreground",
      iconBg: "bg-info/10"
    },
    {
      number: 6,
      title: "Travel to Destination",
      description: "Get your tickets and start your new career abroad",
      icon: Plane,
      color: "bg-accent text-accent-foreground",
      iconBg: "bg-accent/10"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Your Journey to <span className="text-primary">Global Opportunities</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A simple, transparent process to help you land your dream job abroad
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-16 left-[8.33%] right-[8.33%] h-0.5 bg-border" />
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative flex flex-col items-center text-center group"
              >
                {/* Mobile/Tablet connecting line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute top-32 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2 hidden sm:block" />
                )}
                
                {/* Step number circle */}
                <div className={`relative z-10 w-12 h-12 rounded-full ${step.color} flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`mt-4 w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8 text-foreground" />
                </div>
                
                {/* Content */}
                <h3 className="mt-4 font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[200px]">
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
