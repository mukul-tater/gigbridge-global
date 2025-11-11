import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Bell, Briefcase, MessageSquare, CheckCircle } from "lucide-react";

export default function WorkerNotifications() {
  const notifications = [
    {
      id: 1,
      type: "application",
      icon: Briefcase,
      title: "Application Status Update",
      message: "Your application for Senior Welder has been shortlisted",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      type: "message",
      icon: MessageSquare,
      title: "New Message",
      message: "NorthWorks Pvt Ltd sent you a message",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "success",
      icon: CheckCircle,
      title: "Profile Updated",
      message: "Your profile has been successfully updated",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

        <div className="space-y-4 max-w-3xl">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`p-6 ${notification.unread ? "border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${notification.unread ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${notification.unread ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{notification.title}</h3>
                    <p className="text-muted-foreground mb-2">{notification.message}</p>
                    <span className="text-sm text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
