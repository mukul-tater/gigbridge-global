import SalaryProtectionPromise from "@/components/SalaryProtectionPromise";
import { Shield } from "lucide-react";

export default function SalaryProtectionSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-success/[0.04] via-background to-primary/[0.04]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-success/10 text-success mb-4">
              <Shield className="h-3.5 w-3.5" />
              Wage Security
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading tracking-tight mb-4">
              Your salary is protected —{" "}
              <span className="text-gradient">guaranteed</span>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              On traditional agent routes, workers often never see the salary they were promised.
              SafeWork Global holds employer payments in a protected account before you start work.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is our core promise: no chasing payments, no wage theft, no hidden deductions.
              You know exactly what you will earn — in writing, before you travel.
            </p>
          </div>

          <SalaryProtectionPromise variant="hero" />
        </div>
      </div>
    </section>
  );
}
