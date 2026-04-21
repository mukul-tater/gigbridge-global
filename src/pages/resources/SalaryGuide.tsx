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
import { TrendingUp, IndianRupee, ArrowRight, Clock, Home, UtensilsCrossed, Plane, FileCheck, GraduationCap, ShieldCheck } from "lucide-react";
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
      {/* Headline salary band */}
      <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-success/10 text-success border-success/20">Typical monthly take-home</Badge>
            <h3 className="text-2xl md:text-3xl font-heading font-bold">₹70,000 – ₹2,00,000</h3>
            <p className="text-sm text-muted-foreground mt-1">+ overtime paid extra (1.25x – 2x hourly rate, paid weekly or monthly)</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-success font-medium">
            <Clock className="h-4 w-4" />
            Overtime always on top of base salary
          </div>
        </CardContent>
      </Card>

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

      {/* Benefits & perks */}
      <div className="mt-10">
        <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">What's included beyond your salary</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Every SafeWorkGlobal-verified contract clearly lists these perks. No hidden deductions, no surprises.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Free accommodation</h4>
              </div>
              <p className="text-sm text-muted-foreground">Shared/private rooms with electricity, water and Wi-Fi — fully paid by employer.</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Meals provided</h4>
              </div>
              <p className="text-sm text-muted-foreground">3 meals/day or a monthly food allowance (typically ₹8k–₹15k equivalent).</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Flight tickets</h4>
              </div>
              <p className="text-sm text-muted-foreground">Joining flight + return ticket every 2 years (or end of contract) paid by employer.</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Visa & permit support</h4>
              </div>
              <p className="text-sm text-muted-foreground">Work visa, residence permit and renewals fully sponsored — zero cost to worker.</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Overtime pay</h4>
              </div>
              <p className="text-sm text-muted-foreground">1.25x on weekdays, 1.5x weekends, 2x public holidays — added to monthly salary.</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-success" />
                <h4 className="font-semibold">Medical insurance</h4>
              </div>
              <p className="text-sm text-muted-foreground">Full health coverage at site clinics + hospitals. Annual medical check-ups included.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Online training */}
      <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">Free for all workers</Badge>
              <h4 className="font-heading font-bold text-lg mb-1">Online training for better support</h4>
              <p className="text-sm text-muted-foreground">
                Pre-departure orientation, workplace safety, country-specific culture, basic Arabic/English/German, and skill upskilling — delivered on your phone, in your language. Certificates added to your profile to boost your salary band.
              </p>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="rounded-xl whitespace-nowrap">
                Start training
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
