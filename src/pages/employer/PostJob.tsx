import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Job posted successfully!");
    navigate("/employer/manage-jobs");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <Input placeholder="e.g., Senior Welder" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Openings</label>
                <Input type="number" placeholder="5" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uae">United Arab Emirates</SelectItem>
                    <SelectItem value="qatar">Qatar</SelectItem>
                    <SelectItem value="saudi">Saudi Arabia</SelectItem>
                    <SelectItem value="kuwait">Kuwait</SelectItem>
                    <SelectItem value="oman">Oman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input placeholder="e.g., Dubai" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Salary Min (USD/month)</label>
                <Input type="number" placeholder="2000" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Salary Max (USD/month)</label>
                <Input type="number" placeholder="3500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Description</label>
              <Textarea rows={6} placeholder="Describe the role, responsibilities, and requirements..." required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Required Skills</label>
              <Input placeholder="e.g., Welding, Arc Welding, MIG/TIG" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experience Required (years)</label>
                <Input type="number" placeholder="5" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contract Duration</label>
                <Input placeholder="e.g., 24 months" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Benefits & Perks</label>
              <Textarea rows={3} placeholder="Housing, Transportation, Medical Insurance, Annual Leave..." />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Compliance Checks</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>Work visa sponsorship available</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>Health insurance coverage provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>Complies with local labor laws</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>ECR/ECNR requirements verified</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">Post Job</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/employer/dashboard")}>
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </main>
    </div>
  );
}
