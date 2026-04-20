import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { DESTINATION_COUNTRIES, JOB_CATEGORIES } from "@/lib/constants";
import EmployerFlowStepper from "@/components/employer/EmployerFlowStepper";

export default function QuickPostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("");
  const [openings, setOpenings] = useState("5");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in"); return; }
    if (!role || !country || !location) { toast.error("Fill role, country and location"); return; }

    setLoading(true);
    try {
      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          employer_id: user.id,
          title: role,
          description: description || `Hiring ${openings} ${role}(s) for ${location}, ${country}.`,
          location,
          country,
          job_type: "FULL_TIME",
          experience_level: experience,
          openings: parseInt(openings) || 1,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          currency: "INR",
          status: "ACTIVE",
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Job posted!");
      navigate(`/employer/pilot-offer?jobId=${job.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <EmployerFlowStepper current="post" />
      </div>
      <Card className="w-full max-w-2xl mx-auto shadow-elegant">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-heading">Post your job in 60 seconds</h1>
            <p className="text-sm text-muted-foreground mt-1">You can edit details later — let's get candidates flowing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Job role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {JOB_CATEGORIES.filter(c => c !== "All Categories").map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Number of workers *</Label>
                <Input type="number" min={1} value={openings} onChange={(e) => setOpenings(e.target.value)} />
              </div>
              <div>
                <Label>Experience required</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRY">Entry</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {DESTINATION_COUNTRIES.filter(c => c !== "All Countries").map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location/City *</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dubai" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min salary (INR/mo)</Label>
                <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="25000" />
              </div>
              <div>
                <Label>Max salary (INR/mo)</Label>
                <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="40000" />
              </div>
            </div>

            <div>
              <Label>Job description (optional)</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the role..." />
            </div>

            <Button type="submit" size="lg" className="w-full h-12 gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Post Job <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
