import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Globe } from 'lucide-react';
import JobSearchFilters, { type JobFilters } from '@/components/search/JobSearchFilters';
import SavedSearchDialog from '@/components/search/SavedSearchDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock job data for demonstration
const mockJobs = [
  {
    id: '1',
    title: 'Senior Welding Engineer',
    company: 'Dubai Construction Co.',
    location: 'Dubai, UAE',
    salary: '$3,500 - $4,500',
    type: 'Full-time',
    visaSponsorship: true,
    postedDate: '2 days ago',
    description: 'Experienced welder needed for large construction project.',
    skills: ['Welding', 'Construction', 'Safety Management']
  },
  {
    id: '2',
    title: 'Electrical Supervisor',
    company: 'Gulf Power Systems',
    location: 'Riyadh, Saudi Arabia',
    salary: '$4,000 - $5,500',
    type: 'Full-time',
    visaSponsorship: true,
    postedDate: '5 days ago',
    description: 'Supervise electrical installations in commercial buildings.',
    skills: ['Electrical', 'Supervision', 'Project Management']
  },
  {
    id: '3',
    title: 'Construction Foreman',
    company: 'Qatar Building Corp',
    location: 'Doha, Qatar',
    salary: '$3,800 - $4,800',
    type: 'Full-time',
    visaSponsorship: true,
    postedDate: '1 week ago',
    description: 'Lead construction team on major infrastructure project.',
    skills: ['Construction', 'Leadership', 'Planning']
  },
];

export default function Jobs() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobFilters>({
    keyword: '',
    location: '',
    country: 'All Countries',
    jobCategory: 'All Categories',
    salaryMin: 0,
    salaryMax: 10000,
    visaSponsorship: false,
    skills: [],
    experienceLevel: 'All Levels'
  });
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [jobs, setJobs] = useState(mockJobs);

  const handleSearch = () => {
    setLoading(true);
    // Simulate search with mock data
    setTimeout(() => {
      let filtered = [...mockJobs];
      
      // Apply filters
      if (filters.keyword) {
        filtered = filtered.filter(job => 
          job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.keyword.toLowerCase())
        );
      }
      
      if (filters.visaSponsorship) {
        filtered = filtered.filter(job => job.visaSponsorship);
      }
      
      if (filters.skills.length > 0) {
        filtered = filtered.filter(job =>
          filters.skills.some(skill => job.skills.includes(skill))
        );
      }
      
      setJobs(filtered);
      setLoading(false);
      toast.success(`Found ${filtered.length} jobs matching your criteria`);
    }, 1000);
  };

  const handleSaveSearch = async (name: string, alertsEnabled: boolean, alertFrequency: string) => {
    if (!user) {
      toast.error('Please login to save searches');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          search_type: 'jobs',
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Global Opportunity</h1>
          <p className="text-muted-foreground">
            Browse thousands of international job opportunities with visa sponsorship
          </p>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside>
            <JobSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              onSaveSearch={() => setShowSaveDialog(true)}
              loading={loading}
            />
            
            {user && (
              <Card className="mt-4 p-4">
                <Link to="/worker/saved-searches">
                  <Button variant="outline" className="w-full">
                    View Saved Searches
                  </Button>
                </Link>
              </Card>
            )}
          </aside>

          {/* Job Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {jobs.length} Jobs Found
              </h2>
              <select className="border rounded-md px-3 py-2 text-sm bg-card">
                <option>Sort by: Most Recent</option>
                <option>Sort by: Salary (High to Low)</option>
                <option>Sort by: Salary (Low to High)</option>
                <option>Sort by: Relevance</option>
              </select>
            </div>

            {jobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  {job.visaSponsorship && (
                    <Badge className="bg-success text-success-foreground">
                      <Globe className="h-3 w-3 mr-1" />
                      Visa Sponsorship
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.postedDate}
                  </span>
                </div>

                <p className="text-muted-foreground mb-4">{job.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {job.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  <Link to={`/jobs/${job.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <SavedSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveSearch}
      />
    </div>
  );
}
