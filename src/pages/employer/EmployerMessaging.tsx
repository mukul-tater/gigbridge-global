import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

export default function EmployerMessaging() {
  return (
    <div className="flex min-h-screen bg-background w-full">
      <EmployerSidebar />
      <div className="flex-1 flex flex-col">
        <EmployerHeader />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
        <PortalBreadcrumb />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Messages</h1>

        <Card className="p-8 md:p-12 text-center">
          <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Start conversations with candidates or workers here.
          </p>
        </Card>
        </main>
      </div>
    </div>
  );
}
