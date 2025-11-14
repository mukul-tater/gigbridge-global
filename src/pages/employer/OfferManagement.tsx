import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Download, Eye, Send, Clock } from "lucide-react";
import { toast } from "sonner";

export default function OfferManagement() {
  const offers = [
    {
      id: 1,
      candidate: "Amit Kumar",
      position: "Senior Welder",
      salary: "3000 USD/month",
      benefits: ["Housing", "Transportation", "Medical Insurance"],
      startDate: "2024-03-01",
      status: "SENT",
      sentAt: "2024-01-25",
    },
    {
      id: 2,
      candidate: "Priya Sharma",
      position: "Electrician",
      salary: "2800 USD/month",
      benefits: ["Housing", "Medical Insurance", "Annual Leave"],
      startDate: "2024-03-15",
      status: "ACCEPTED",
      sentAt: "2024-01-20",
      respondedAt: "2024-01-22",
    },
    {
      id: 3,
      candidate: "Rajesh Singh",
      position: "Construction Worker",
      salary: "2500 USD/month",
      benefits: ["Housing", "Transportation"],
      startDate: "2024-02-20",
      status: "DRAFT",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge className="bg-primary">Sent - Awaiting Response</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSendOffer = (id: number, candidate: string) => {
    toast.success(`Offer letter sent to ${candidate}`);
  };

  const handleDownload = (candidate: string) => {
    toast.success(`Downloading offer letter for ${candidate}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Offer Letter Management</h1>
          <p className="text-muted-foreground">Create and manage employment offers</p>
        </div>

        <div className="space-y-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileSignature className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{offer.candidate}</h3>
                      <p className="text-sm text-muted-foreground">{offer.position}</p>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{offer.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{offer.startDate}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {offer.sentAt && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Sent on {offer.sentAt}</span>
                      {offer.respondedAt && (
                        <>
                          <span>•</span>
                          <span>Responded on {offer.respondedAt}</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {offer.status === "DRAFT" && (
                      <>
                        <Button onClick={() => handleSendOffer(offer.id, offer.candidate)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Offer
                        </Button>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </>
                    )}
                    {offer.status !== "DRAFT" && (
                      <>
                        <Button variant="outline" onClick={() => handleDownload(offer.candidate)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Create New Offer Letter</h2>
          <p className="text-muted-foreground mb-4">
            Select a shortlisted candidate to generate an offer letter
          </p>
          <Button>Create Offer</Button>
        </Card>
      </main>
    </div>
  );
}
