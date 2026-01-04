import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, FileCheck, AlertCircle } from "lucide-react";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";

export default function TravelStatus() {
  const travelInfo = {
    visaStatus: "APPROVED",
    visaNumber: "UAE-2024-12345",
    visaIssueDate: "2024-01-15",
    visaExpiryDate: "2026-01-15",
    travelStatus: "BOOKED",
    flightNumber: "EK 542",
    departureDate: "2024-02-01",
    departureTime: "14:30",
    departureAirport: "Indira Gandhi International Airport (DEL)",
    arrivalDate: "2024-02-01",
    arrivalTime: "18:45",
    arrivalAirport: "Dubai International Airport (DXB)",
    destination: "Dubai, UAE",
    bookingReference: "ABC123XYZ",
  };

  const getVisaStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "ISSUED":
        return <Badge className="bg-primary">Issued</Badge>;
      case "APPLIED":
        return <Badge className="bg-yellow-500">Applied</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Applied</Badge>;
    }
  };

  const getTravelStatusBadge = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <Badge className="bg-primary">Booked</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col">
        <WorkerHeader />
        <main className="flex-1 p-4 md:p-8">
          <PortalBreadcrumb />
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Travel & Visa Status</h1>
            <p className="text-muted-foreground">Track your visa application and travel details</p>
          </div>

        <div className="space-y-6 max-w-4xl">
          {/* Visa Status */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Visa Status</h2>
                    <p className="text-sm text-muted-foreground">Work visa for {travelInfo.destination}</p>
                  </div>
                  {getVisaStatusBadge(travelInfo.visaStatus)}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Visa Number</p>
                    <p className="font-medium">{travelInfo.visaNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{travelInfo.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{travelInfo.visaIssueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{travelInfo.visaExpiryDate}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Visa Approved</p>
                      <p className="text-sm text-green-700 mt-1">
                        Your work visa has been approved. You can now proceed with travel arrangements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Travel Details */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Travel Details</h2>
                    <p className="text-sm text-muted-foreground">Flight booking information</p>
                  </div>
                  {getTravelStatusBadge(travelInfo.travelStatus)}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Flight Number</p>
                    <p className="font-semibold text-lg">{travelInfo.flightNumber}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Departure */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>Departure</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Airport</p>
                        <p className="font-medium">{travelInfo.departureAirport}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <p className="font-medium">{travelInfo.departureDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">{travelInfo.departureTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>Arrival</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Airport</p>
                        <p className="font-medium">{travelInfo.arrivalAirport}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <p className="font-medium">{travelInfo.arrivalDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">{travelInfo.arrivalTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="font-medium text-lg">{travelInfo.bookingReference}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Travel Reminder</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please arrive at the airport at least 3 hours before departure. Keep your passport, visa, and ticket ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        </main>
      </div>
    </div>
  );
}
