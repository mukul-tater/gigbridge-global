import WorkerSidebar from "@/components/worker/WorkerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export default function WorkerDocuments() {
  const documents = [
    { id: 1, name: "Resume.pdf", type: "Resume", uploadDate: "2024-01-10", size: "245 KB" },
    { id: 2, name: "Welder_Certificate.pdf", type: "Certification", uploadDate: "2024-01-08", size: "1.2 MB" },
    { id: 3, name: "ID_Proof.pdf", type: "Identity", uploadDate: "2024-01-05", size: "890 KB" },
  ];

  const handleUpload = () => {
    toast.success("Document uploaded successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{doc.type}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{doc.uploadDate}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
