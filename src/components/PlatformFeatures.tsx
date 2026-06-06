import { FileSignature, ShieldCheck, GraduationCap, Store, Smartphone, Globe2 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Employer verification",
    description: "Every company is checked before they can post jobs. No fake listings, no ghost employers.",
  },
  {
    icon: FileSignature,
    title: "Digital contracts",
    description: "Clear written terms for salary, schedule, and duties — signed before you travel.",
  },
  {
    icon: GraduationCap,
    title: "PDOT & compliance training",
    description: "Pre-departure orientation and ECR/ECNR checks built into your onboarding.",
  },
  {
    icon: Store,
    title: "eMitra onboarding centres",
    description: "Sign up at trusted local eMitra shops across Rajasthan — offline trust, online scale.",
  },
  {
    icon: Smartphone,
    title: "Track your application",
    description: "See every step — applied, shortlisted, contract signed, visa cleared — in one place.",
  },
  {
    icon: Globe2,
    title: "Support after arrival",
    description: "Insurance, remittance guidance, and ongoing help once you start working abroad.",
  },
];

export default function PlatformFeatures() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary mb-3">
            Compliance-First Platform
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight mb-3">
            Everything you need for a{" "}
            <span className="text-gradient">safe move abroad</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            SafeWork Global is not just a job board — it is a full compliance ecosystem
            built to protect workers at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-5 sm:p-6 rounded-xl border border-border/60 bg-card hover:border-primary/25 transition-colors"
            >
              <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 h-fit">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-heading text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
