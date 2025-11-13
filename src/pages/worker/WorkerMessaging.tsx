import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function WorkerMessaging() {
  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col">
        <WorkerHeader />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>

          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
            <p className="text-muted-foreground">
              When employers reach out to you, their messages will appear here.
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
