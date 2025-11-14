import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ComplianceReports() {
  const reports = [
    {
      id: 1,
      worker: "Amit Kumar",
      reportType: "Visa Compliance Report",
      status: "COMPLIANT",
      generatedAt: "2024-02-01",
      expiresAt: "2025-02-01",
      items: [
        { name: "Valid Work Visa", status: "COMPLIANT" },
        { name: "Health Insurance", status: "COMPLIANT" },
        { name: "Employment Contract", status: "COMPLIANT" },
      ],
    },
    {
      id: 2,
      worker: "Priya Sharma",
      reportType: "Insurance Compliance",
      status: "PENDING",
      generatedAt: "2024-01-28",
      items: [
        { name: "Health Insurance", status: "COMPLIANT" },
        { name: "Life Insurance", status: "PENDING" },
        { name: "Travel Insurance", status: "COMPLIANT" },
      ],
    },
    {
      id: 3,
      worker: "All Workers",
      reportType: "Monthly Compliance Audit",
      status: "COMPLIANT",
      generatedAt: "2024-02-01",
      items: [
        { name: "Worker Documentation", status: "COMPLIANT" },
        { name: "Contract Management", status: "COMPLIANT" },
        { name: "Payment Records", status: "COMPLIANT" },
        { name: "Insurance Coverage", status: "COMPLIANT" },
      ],
    },
    {
      id: 4,
      worker: "Rajesh Singh",
      reportType: "Contract Compliance",
      status: "NON_COMPLIANT",
      generatedAt: "2024-01-20",
      items: [
        { name: "Contract Signed", status: "COMPLIANT" },
        { name: "Visa Documentation", status: "NON_COMPLIANT" },
        { name: "Medical Checkup", status: "COMPLIANT" },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500">Compliant</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "NON_COMPLIANT":
        return <Badge className="bg-red-500">Non-Compliant</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "NON_COMPLIANT":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleDownload = (reportType: string, worker: string) => {
    toast.success(`Downloading ${reportType} for ${worker}`);
  };

  const handleGenerateReport = () => {
    toast.success("Generating new compliance report...");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compliance Reports</h1>
          <p className="text-muted-foreground">Track contracts, visas, insurance, and compliance status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-3xl font-bold text-green-600">
                  {reports.filter((r) => r.status === "COMPLIANT").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {reports.filter((r) => r.status === "PENDING").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non-Compliant</p>
                <p className="text-3xl font-bold text-red-600">
                  {reports.filter((r) => r.status === "NON_COMPLIANT").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{report.reportType}</h3>
                      <p className="text-sm text-muted-foreground">{report.worker}</p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="space-y-2 mt-4">
                    {report.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(item.status)}
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <span>Generated: {report.generatedAt}</span>
                    {report.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires: {report.expiresAt}</span>
                      </>
                    )}
                  </div>

                  {report.status === "NON_COMPLIANT" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-900">Action Required</p>
                          <p className="text-red-700 mt-1">
                            Some compliance requirements are not met. Please review and update immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report.reportType, report.worker)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Generate New Report */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Generate New Compliance Report</h2>
          <p className="text-muted-foreground mb-4">
            Create a comprehensive compliance report for contracts, visas, and insurance
          </p>
          <Button onClick={handleGenerateReport}>
            <FileCheck className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>
      </main>
      </div>
    </div>
  );
}
