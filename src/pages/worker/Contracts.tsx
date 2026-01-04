import { useState } from "react";
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSignature, Download, Eye, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Contract {
  id: number;
  title: string;
  employer: string;
  salary: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: string;
  signedAt: string | null;
  documentUrl: string;
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 1,
      title: "Construction Worker - Abu Dhabi",
      employer: "Al Habtoor Group",
      salary: "2500 USD/month",
      duration: "24 months",
      startDate: "2024-02-01",
      endDate: "2026-02-01",
      status: "ACTIVE",
      signedAt: "2024-01-20",
      documentUrl: "#",
    },
    {
      id: 2,
      title: "Welder - Qatar Industrial Project",
      employer: "Qatar Steel Company",
      salary: "3000 USD/month",
      duration: "36 months",
      startDate: "2024-03-15",
      endDate: "2027-03-15",
      status: "SENT",
      signedAt: null,
      documentUrl: "#",
    },
    {
      id: 3,
      title: "Electrician - Dubai Metro Extension",
      employer: "Dubai Metro Corporation",
      salary: "2800 USD/month",
      duration: "18 months",
      startDate: "2023-06-01",
      endDate: "2024-12-01",
      status: "COMPLETED",
      signedAt: "2023-05-15",
      documentUrl: "#",
    },
  ]);

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [signingDialogOpen, setSigningDialogOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "SENT":
        return <Badge className="bg-primary">Awaiting Signature</Badge>;
      case "SIGNED":
        return <Badge className="bg-purple-500">Signed</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openSigningDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setTermsAccepted(false);
    setSigningDialogOpen(true);
  };

  const handleSign = async () => {
    if (!selectedContract || !termsAccepted) return;

    setIsSigning(true);
    
    // Simulate signing process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const signedDate = new Date().toISOString().split('T')[0];
    
    setContracts(prev => 
      prev.map(c => 
        c.id === selectedContract.id 
          ? { ...c, status: "ACTIVE", signedAt: signedDate }
          : c
      )
    );
    
    setIsSigning(false);
    setSigningDialogOpen(false);
    toast.success(`Contract signed successfully: ${selectedContract.title}`);
  };

  const handleDownload = (contractTitle: string) => {
    toast.success(`Downloading: ${contractTitle}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contracts & Offer Letters</h1>
          <p className="text-muted-foreground">View and manage your employment contracts</p>
        </div>

        <div className="grid gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileSignature className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{contract.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{contract.employer}</p>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{contract.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{contract.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{contract.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{contract.endDate}</p>
                    </div>
                  </div>

                  {contract.signedAt && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Signed on {contract.signedAt}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => handleDownload(contract.title)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(contract.title)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {contract.status === "SENT" && (
                      <Button onClick={() => openSigningDialog(contract)}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Sign Contract
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contract Signing Dialog */}
        <Dialog open={signingDialogOpen} onOpenChange={setSigningDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Sign Employment Contract</DialogTitle>
              <DialogDescription>
                Review the contract details below and sign to accept the terms.
              </DialogDescription>
            </DialogHeader>

            {selectedContract && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{selectedContract.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employer</p>
                    <p className="font-medium">{selectedContract.employer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{selectedContract.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedContract.duration}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{selectedContract.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{selectedContract.endDate}</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">Contract Preview (Placeholder)</p>
                  <div className="h-32 border-2 border-dashed border-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                    Full contract document would be displayed here
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    I have read and agree to the terms and conditions of this employment contract. 
                    I understand that this is a legally binding agreement.
                  </label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSigningDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSign} 
                disabled={!termsAccepted || isSigning}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <FileSignature className="h-4 w-4 mr-2" />
                    Sign Contract
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}