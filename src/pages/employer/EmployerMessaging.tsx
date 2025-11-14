import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function EmployerMessaging() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground">
            Start conversations with candidates or workers here.
          </p>
        </Card>
      </main>
      </div>
    </div>
  );
}
