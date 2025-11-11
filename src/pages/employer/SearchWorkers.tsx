import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";

export default function SearchWorkers() {
  const workers = [
    { id: 1, name: "Amit Kumar", skills: ["Welding", "Arc Welding"], experience: 5, location: "Mumbai" },
    { id: 2, name: "Priya Patel", skills: ["Painting", "Surface Prep"], experience: 4, location: "Delhi" },
    { id: 3, name: "Vikram Singh", skills: ["Masonry", "Concrete"], experience: 8, location: "Bangalore" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Search Workers</h1>

        <Card className="p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by skills, name, or location..." />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {workers.map((worker) => (
            <Card key={worker.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{worker.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {worker.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{worker.experience} years experience</span>
                    <span>•</span>
                    <span>{worker.location}</span>
                  </div>
                </div>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
