import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Zap, Coins, ArrowRight } from "lucide-react";

export default function EmployerTrust() {
  const navigate = useNavigate();

  const points = [
    { icon: Coins, title: "1% cost vs 20–30% agents", desc: "Pay only 1% platform fee — and only after you hire." },
    { icon: ShieldCheck, title: "Verified workers", desc: "Every worker is ID, document and skill verified." },
    { icon: CheckCircle2, title: "Escrow-secured payments", desc: "Funds held safely. Released after work completion." },
    { icon: Zap, title: "Faster hiring", desc: "Shortlists in 7–10 days for your pilot batch." },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-info/5 p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardContent className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2">Why employers choose SafeWork Global</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Start with a pilot — no upfront fees</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {points.map((p) => (
              <div key={p.title} className="flex gap-3 p-4 rounded-xl border border-border bg-card/50">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full h-12 gap-2" onClick={() => navigate("/employer/quick-post-job")}>
            Post your first job <ArrowRight className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={() => navigate("/employer/dashboard")}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
