import { useState } from 'react';
import EmployerSidebar from '@/components/employer/EmployerSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Award, Star, Globe, Mail } from 'lucide-react';
import WorkerSearchFilters, { type WorkerFilters } from '@/components/search/WorkerSearchFilters';
import SavedSearchDialog from '@/components/search/SavedSearchDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// Mock worker data
const mockWorkers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    nationality: 'India',
    location: 'Mumbai, India',
    skills: ['Welding', 'Fabrication', 'Safety Management'],
    experience: 8,
    availability: 'Immediately',
    expectedSalary: '$3,200',
    hasPassport: true,
    hasVisa: false,
    rating: 4.8,
    completedProjects: 45
  },
  {
    id: '2',
    name: 'Mohammed Ali',
    nationality: 'Egypt',
    location: 'Cairo, Egypt',
    skills: ['Electrical', 'Installation', 'Maintenance'],
    experience: 6,
    availability: 'Within 1 month',
    expectedSalary: '$2,800',
    hasPassport: true,
    hasVisa: true,
    rating: 4.6,
    completedProjects: 32
  },
  {
    id: '3',
    name: 'Juan Santos',
    nationality: 'Philippines',
    location: 'Manila, Philippines',
    skills: ['Construction', 'Carpentry', 'Project Management'],
    experience: 12,
    availability: 'Within 2 months',
    expectedSalary: '$3,500',
    hasPassport: true,
    hasVisa: false,
    rating: 4.9,
    completedProjects: 68
  },
];

export default function SearchWorkers() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<WorkerFilters>({
    keyword: '',
    nationality: 'All Nationalities',
    currentLocation: '',
    skills: [],
    experienceYears: [0, 30],
    salaryMin: 0,
    salaryMax: 10000,
    hasPassport: false,
    hasVisa: false,
    availability: 'All'
  });
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workers, setWorkers] = useState(mockWorkers);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockWorkers];
      
      if (filters.keyword) {
        filtered = filtered.filter(worker =>
          worker.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          worker.skills.some(skill => skill.toLowerCase().includes(filters.keyword.toLowerCase()))
        );
      }
      
      if (filters.hasPassport) {
        filtered = filtered.filter(worker => worker.hasPassport);
      }
      
      if (filters.hasVisa) {
        filtered = filtered.filter(worker => worker.hasVisa);
      }
      
      if (filters.skills.length > 0) {
        filtered = filtered.filter(worker =>
          filters.skills.some(skill => worker.skills.includes(skill))
        );
      }
      
      filtered = filtered.filter(worker =>
        worker.experience >= filters.experienceYears[0] &&
        worker.experience <= filters.experienceYears[1]
      );
      
      setWorkers(filtered);
      setLoading(false);
      toast.success(`Found ${filtered.length} workers matching your criteria`);
    }, 1000);
  };

  const handleSaveSearch = async (name: string, alertsEnabled: boolean, alertFrequency: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          search_type: 'workers',
          name,
          filters: filters as any,
          alerts_enabled: alertsEnabled,
          alert_frequency: alertFrequency
        } as any);

      if (error) throw error;
      toast.success('Search saved successfully!');
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
      throw error;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Skilled Workers</h1>
          <p className="text-muted-foreground">
            Search and connect with qualified workers from around the world
          </p>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside>
            <WorkerSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              onSaveSearch={() => setShowSaveDialog(true)}
              loading={loading}
            />
            
            <Card className="mt-4 p-4">
              <Link to="/employer/saved-searches">
                <Button variant="outline" className="w-full">
                  View Saved Searches
                </Button>
              </Link>
            </Card>
          </aside>

          {/* Worker Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {workers.length} Workers Found
              </h2>
              <select className="border rounded-md px-3 py-2 text-sm bg-card">
                <option>Sort by: Best Match</option>
                <option>Sort by: Experience (High to Low)</option>
                <option>Sort by: Rating</option>
                <option>Sort by: Availability</option>
              </select>
            </div>

            {workers.map((worker) => (
              <Card key={worker.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{worker.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {worker.nationality}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {worker.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">{worker.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {worker.completedProjects} projects
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {worker.experience} years
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Availability</p>
                        <p className="font-semibold">{worker.availability}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Salary</p>
                        <p className="font-semibold">{worker.expectedSalary}/month</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {worker.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                      {worker.hasPassport && (
                        <Badge variant="secondary">Valid Passport</Badge>
                      )}
                      {worker.hasVisa && (
                        <Badge className="bg-success text-success-foreground">Work Visa</Badge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button>View Profile</Button>
                      <Button variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline">Shortlist</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {workers.length === 0 && (
              <Card className="p-12 text-center">
                <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No workers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <SavedSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveSearch}
      />
    </div>
  );
}
