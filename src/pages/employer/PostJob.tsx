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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input placeholder="e.g., Dubai, UAE" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Salary Range</label>
                <Input placeholder="e.g., $25-30/hr" required />
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

            <div>
              <label className="block text-sm font-medium mb-2">Experience Required (years)</label>
              <Input type="number" placeholder="5" required />
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
