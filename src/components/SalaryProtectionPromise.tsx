import { Shield, Wallet, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "hero" | "card";
}

/**
 * Plain-language salary protection promise.
 * Replaces the technical word "escrow" with a 3-line guarantee
 * any worker can understand in 10 seconds.
 */
export default function SalaryProtectionPromise({ className, variant = "card" }: Props) {
  const steps = [
    {
      icon: Wallet,
      title: "Employer deposits your salary first",
      desc: "Before you start work, your full salary is paid into a protected SafeWork account.",
    },
    {
      icon: Shield,
      title: "SafeWork holds the money safely",
      desc: "Your employer cannot touch it. We hold it until your work is done.",
    },
    {
      icon: CheckCircle2,
      title: "You get paid — guaranteed",
      desc: "Once the job is complete, the money is released to you. No chasing. No fraud.",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-success/30 bg-gradient-to-br from-success/5 via-background to-primary/5 p-5 sm:p-6",
        variant === "hero" && "shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-success/15">
          <Shield className="h-4 w-4 text-success" />
        </div>
        <h3 className="font-bold font-heading text-foreground text-base sm:text-lg">
          Your salary is protected — guaranteed
        </h3>
      </div>

      <ol className="space-y-3">
        {steps.map((step, idx) => (
          <li key={step.title} className="flex gap-3">
            <div className="shrink-0 flex flex-col items-center">
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1" />
              )}
            </div>
            <div className="pb-2">
              <p className="font-semibold text-sm text-foreground leading-snug">
                {step.title}
              </p>
              <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
        SafeWork charges only a 1% platform fee. No hidden costs. No agent commissions.
      </p>
    </div>
  );
}
