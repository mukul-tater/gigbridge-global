import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, Phone, MapPin, Clock, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function InterviewScheduling() {
  const scheduledInterviews = [
    {
      id: 1,
      candidate: "Amit Kumar",
      position: "Senior Welder",
      date: "2024-02-15",
      time: "10:00 AM",
      duration: "45 minutes",
      mode: "VIDEO",
      meetingLink: "https://zoom.us/j/123456789",
      status: "SCHEDULED",
    },
    {
      id: 2,
      candidate: "Priya Sharma",
      position: "Electrician",
      date: "2024-02-16",
      time: "2:00 PM",
      duration: "30 minutes",
      mode: "PHONE",
      status: "SCHEDULED",
    },
    {
      id: 3,
      candidate: "Rajesh Singh",
      position: "Construction Worker",
      date: "2024-02-10",
      time: "11:00 AM",
      duration: "45 minutes",
      mode: "VIDEO",
      status: "COMPLETED",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-yellow-500">Rescheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "PHONE":
        return <Phone className="h-4 w-4" />;
      case "IN_PERSON":
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleJoinMeeting = (link: string) => {
    window.open(link, "_blank");
    toast.success("Opening meeting link...");
  };

  const handleReschedule = (id: number) => {
    toast.success("Interview rescheduled");
  };

  const handleCancel = (id: number) => {
    toast.error("Interview cancelled");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Scheduling</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {scheduledInterviews
              .filter((interview) => interview.status === "SCHEDULED")
              .map((interview) => (
                <Card key={interview.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{interview.candidate}</h3>
                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                          </div>
                          {getStatusBadge(interview.status)}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.time} • {interview.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {getModeIcon(interview.mode)}
                            <span>{interview.mode}</span>
                          </div>
                        </div>

                        {interview.meetingLink && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJoinMeeting(interview.meetingLink!)}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReschedule(interview.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancel(interview.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {scheduledInterviews
              .filter((interview) => interview.status === "COMPLETED")
              .map((interview) => (
                <Card key={interview.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{interview.candidate}</h3>
                          <p className="text-sm text-muted-foreground">{interview.position}</p>
                        </div>
                        {getStatusBadge(interview.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span>{interview.date}</span>
                        <span>•</span>
                        <span>{interview.time}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        View Feedback
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {scheduledInterviews.map((interview) => (
              <Card key={interview.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{interview.candidate}</h3>
                        <p className="text-sm text-muted-foreground">{interview.position}</p>
                      </div>
                      {getStatusBadge(interview.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>{interview.date}</span>
                      <span>•</span>
                      <span>{interview.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
