import { Search, FileText, CheckCircle, Video, Shield, Plane } from "lucide-react";

const ProcessTimeline = () => {
  const steps = [
    { number: 1, title: "Search Jobs", description: "Browse verified international opportunities", icon: Search, bgColor: "bg-primary", iconGradient: "bg-gradient-to-br from-primary to-primary/70" },
    { number: 2, title: "Apply", description: "Submit application with your documents", icon: FileText, bgColor: "bg-secondary", iconGradient: "bg-gradient-to-br from-secondary to-secondary/70" },
    { number: 3, title: "Get Shortlisted", description: "Employers review qualified candidates", icon: CheckCircle, bgColor: "bg-success", iconGradient: "bg-gradient-to-br from-success to-success/70" },
    { number: 4, title: "Interview", description: "Complete interviews and get offer", icon: Video, bgColor: "bg-warning", iconGradient: "bg-gradient-to-br from-warning to-warning/70" },
    { number: 5, title: "Visa Process", description: "Complete visa and ECR verification", icon: Shield, bgColor: "bg-info", iconGradient: "bg-gradient-to-br from-info to-info/70" },
    { number: 6, title: "Travel", description: "Start your new career abroad", icon: Plane, bgColor: "bg-gradient-to-r from-primary to-info", iconGradient: "bg-gradient-to-br from-primary to-info" }
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-20 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary mb-4">
            How it Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading mb-4 tracking-tight">
            Your Path to <span className="text-gradient">Global Success</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            A simple, transparent 6-step process to help you land your dream job abroad
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number */}
              <div className="relative mb-4">
                <div className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full ${step.bgColor} flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
              </div>

              {/* Icon Card */}
              <div className="w-full p-3 sm:p-4 rounded-xl bg-card border border-border/50 group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300 mb-2.5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${step.iconGradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>

              <h3 className="font-semibold font-heading text-foreground text-sm sm:text-base mb-1">
                {step.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed max-w-[140px] sm:max-w-[160px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-14 lg:mt-20">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Ready to start your journey?
            <span className="text-primary font-medium ml-1">Search jobs above</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
