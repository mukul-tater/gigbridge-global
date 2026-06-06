import { Shield, BadgeCheck, Wallet, FileCheck } from "lucide-react";

const trustPoints = [
  {
    icon: Wallet,
    title: "Worker pays ₹0",
    description: "Free to sign up and apply. No agent fees, no hidden charges.",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    icon: BadgeCheck,
    title: "Verified jobs only",
    description: "Every employer and job listing is checked before it goes live.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Shield,
    title: "Salary protected",
    description: "Your salary is held safely until you complete the work — no wage theft.",
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    icon: FileCheck,
    title: "Compliance support",
    description: "ECR/ECNR checks, digital contracts, and visa guidance when you need it.",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

export default function WhySafeWork() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-success/10 text-success mb-3">
            Why SafeWork Global
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight mb-2">
            A safe way to work abroad
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Built for Indian workers — no agents, no upfront fees, no fake promises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className={`inline-flex p-2.5 rounded-lg ${point.iconBg} mb-3`}>
                <point.icon className={`h-5 w-5 ${point.iconColor}`} />
              </div>
              <h3 className="font-semibold font-heading text-foreground mb-1.5">
                {point.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
