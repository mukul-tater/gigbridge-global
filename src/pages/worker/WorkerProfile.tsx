import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function WorkerProfile() {
  const { user, profile } = useAuth();

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="max-w-3xl space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input defaultValue={profile?.full_name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" defaultValue={user?.email || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input defaultValue={profile?.phone || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea rows={4} placeholder="Tell us about yourself..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills & Experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Skills</label>
                <Input placeholder="e.g., Welding, Electrical, Plumbing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <Input type="number" placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Certifications</label>
                <Textarea rows={3} placeholder="List your certifications..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Immigration Documents</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Passport Number</label>
                <Input placeholder="Enter passport number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Passport Issue Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Passport Expiry Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Visa Type</label>
                <Input placeholder="e.g., Work Visa, Employment Visa" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ECR/ECNR Status</label>
                <select className="w-full border rounded-md p-2">
                  <option value="">Select Status</option>
                  <option value="ECR">ECR (Emigration Check Required)</option>
                  <option value="ECNR">ECNR (Emigration Check Not Required)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Countries</label>
                <Input placeholder="e.g., UAE, Qatar, Saudi Arabia, Kuwait" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Industries</label>
                <Input placeholder="e.g., Construction, Manufacturing, Oil & Gas" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expected Salary Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Min (USD)" />
                  <Input type="number" placeholder="Max (USD)" />
                </div>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
