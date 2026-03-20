import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminNavGroups, adminProfileMenu } from "@/config/adminNav";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ComplianceCheck() {
  return (
    <DashboardLayout navGroups={adminNavGroups} portalLabel="Admin Panel" portalName="Admin Panel" profileMenuItems={adminProfileMenu}>
        <h1 className="text-3xl font-bold mb-8">Compliance & ECR Check</h1>

        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Compliance Management</h2>
          <p className="text-muted-foreground">
            ECR checks and compliance verification tools will appear here.
          </p>
        </Card>
      </DashboardLayout>
  );
}
