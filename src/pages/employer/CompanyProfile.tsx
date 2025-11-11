import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CompanyProfile() {
  const handleSave = () => {
    toast.success("Company profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Company Profile</h1>

        <div className="max-w-3xl space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <Input defaultValue="ShreeFab Industries" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Registration Number</label>
                <Input defaultValue="CIN-U12345MH2015PTC123456" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GST Number</label>
                <Input defaultValue="27AABCS1234F1Z5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Description</label>
                <Textarea rows={4} placeholder="Tell us about your company..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <Input type="email" defaultValue="hr@shreefab.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Phone</label>
                <Input defaultValue="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea rows={3} defaultValue="Plot 45, MIDC Industrial Area, Mumbai, Maharashtra 400001" />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
