import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function WorkerProfile() {
  const { user } = useAuth();

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
                <Input defaultValue={user?.name} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" defaultValue={user?.email} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <Input defaultValue={user?.mobile} />
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
            <h2 className="text-xl font-bold mb-4">Work Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Locations</label>
                <Input placeholder="e.g., Dubai, Qatar, Saudi Arabia" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expected Salary (per hour)</label>
                <Input type="number" placeholder="25" />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
