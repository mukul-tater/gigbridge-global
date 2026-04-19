import ResourcePageLayout from "@/components/ResourcePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, IndianRupee, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const rows = [
  { role: "Welder", india: "₹18k – ₹35k", uae: "₹70k – ₹1.1L", ksa: "₹65k – ₹95k", qatar: "₹70k – ₹1L", germany: "₹2L – ₹3L" },
  { role: "Electrician", india: "₹20k – ₹38k", uae: "₹75k – ₹1.2L", ksa: "₹70k – ₹1L", qatar: "₹75k – ₹1.1L", germany: "₹2.2L – ₹3.2L" },
  { role: "Plumber", india: "₹18k – ₹32k", uae: "₹65k – ₹95k", ksa: "₹60k – ₹90k", qatar: "₹65k – ₹95k", germany: "₹2L – ₹3L" },
  { role: "Carpenter", india: "₹17k – ₹30k", uae: "₹60k – ₹90k", ksa: "₹55k – ₹85k", qatar: "₹60k – ₹85k", germany: "₹1.9L – ₹2.8L" },
  { role: "Mason", india: "₹16k – ₹28k", uae: "₹55k – ₹80k", ksa: "₹50k – ₹75k", qatar: "₹55k – ₹80k", germany: "₹1.8L – ₹2.6L" },
  { role: "Heavy Vehicle Driver", india: "₹22k – ₹40k", uae: "₹70k – ₹1L", ksa: "₹65k – ₹95k", qatar: "₹70k – ₹1L", germany: "₹2L – ₹3L" },
  { role: "Construction Foreman", india: "₹25k – ₹50k", uae: "₹1L – ₹1.6L", ksa: "₹95k – ₹1.4L", qatar: "₹1L – ₹1.5L", germany: "₹2.5L – ₹3.8L" },
  { role: "Nurse (general)", india: "₹25k – ₹45k", uae: "₹1.2L – ₹1.8L", ksa: "₹1.2L – ₹1.7L", qatar: "₹1.2L – ₹1.8L", germany: "₹2.4L – ₹3.5L" },
  { role: "Caregiver / Domestic", india: "₹15k – ₹25k", uae: "₹50k – ₹75k", ksa: "₹45k – ₹70k", qatar: "₹50k – ₹75k", germany: "₹1.6L – ₹2.4L" },
  { role: "Hospitality (F&B)", india: "₹16k – ₹28k", uae: "₹55k – ₹85k", ksa: "₹50k – ₹75k", qatar: "₹55k – ₹80k", germany: "₹1.7L – ₹2.5L" },
];

export default function SalaryGuide() {
  return (
    <ResourcePageLayout
      title="Overseas Salary Guide for Indian Workers | SafeWorkGlobal"
      description="Compare monthly take-home salaries for Indian workers in UAE, Saudi Arabia, Qatar, Germany and more — by role."
      eyebrow="Salary Guide"
      heading="What you'll really earn abroad"
      intro="Indicative monthly take-home in INR (after typical deductions, before bonuses). Figures are based on 2024 placement data from our employer network."
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">🇮🇳 India</TableHead>
                  <TableHead className="font-semibold">🇦🇪 UAE</TableHead>
                  <TableHead className="font-semibold">🇸🇦 Saudi</TableHead>
                  <TableHead className="font-semibold">🇶🇦 Qatar</TableHead>
                  <TableHead className="font-semibold">🇩🇪 Germany</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.role} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{r.role}</TableCell>
                    <TableCell className="text-muted-foreground">{r.india}</TableCell>
                    <TableCell className="font-medium text-success">{r.uae}</TableCell>
                    <TableCell className="font-medium text-success">{r.ksa}</TableCell>
                    <TableCell className="font-medium text-success">{r.qatar}</TableCell>
                    <TableCell className="font-medium text-success">{r.germany}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-5">
            <TrendingUp className="h-5 w-5 text-success mb-2" />
            <h4 className="font-semibold mb-1">3 – 5x average uplift</h4>
            <p className="text-sm text-muted-foreground">Indian workers typically earn 3–5x their domestic salary in Gulf countries and 6–10x in Europe.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <IndianRupee className="h-5 w-5 text-primary mb-2" />
            <h4 className="font-semibold mb-1">Free housing & food</h4>
            <p className="text-sm text-muted-foreground">Most Gulf contracts include accommodation, meals and transport — meaning take-home is largely savings.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Badge className="bg-info/10 text-info border-info/20 mb-2">No tax</Badge>
            <h4 className="font-semibold mb-1">Zero income tax in Gulf</h4>
            <p className="text-sm text-muted-foreground">UAE, Saudi, Qatar, Bahrain, Oman and Kuwait do not charge personal income tax on salaries.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-10 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 text-center">
        <h3 className="text-lg font-heading font-bold mb-1">See live salaries on real jobs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Browse current openings with salary in INR — no guesswork.
        </p>
        <Link to="/jobs">
          <Button size="lg" className="rounded-xl">
            View live jobs <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </ResourcePageLayout>
  );
}
