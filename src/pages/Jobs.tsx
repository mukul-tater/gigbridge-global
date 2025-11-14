import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WorkerSidebar from '@/components/worker/WorkerSidebar';
import WorkerHeader from '@/components/worker/WorkerHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Globe } from 'lucide-react';
import JobSearchFilters, { type JobFilters } from '@/components/search/JobSearchFilters';
import SavedSearchDialog from '@/components/search/SavedSearchDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  category: string;
  visaSponsorship: boolean;
  postedDate: string;
  description: string;
  skills: string[];
}

export default function Jobs() {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs on mount
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, jobCategory: category }));
    }
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_skills (skill_name),
          employer_profiles!jobs_employer_id_fkey (company_name)
        `)
        .eq('status', 'ACTIVE')
        .order('posted_at', { ascending: false });

      if (error) throw error;

      const formattedJobs: Job[] = (data || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.employer_profiles?.company_name || 'Company',
        location: `${job.location}, ${job.country}`,
        salary: `${job.currency} ${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K`,
        type: job.job_type === 'FULL_TIME' ? 'Full-time' : job.job_type === 'PART_TIME' ? 'Part-time' : 'Contract',
        category: job.title.split(' ')[0],
        visaSponsorship: job.visa_sponsorship || false,
        postedDate: new Date(job.posted_at).toLocaleDateString(),
        description: job.description.substring(0, 150) + '...',
        skills: job.job_skills?.map((s: any) => s.skill_name) || []
      }));

      applyFilters(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (jobsToFilter: Job[]) => {
    let filtered = [...jobsToFilter];
    
    if (filters.keyword) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.country && filters.country !== 'All Countries') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.jobCategory && filters.jobCategory !== 'All Categories') {
      filtered = filtered.filter(job =>
        job.category?.toLowerCase().includes(filters.jobCategory.toLowerCase()) ||
        job.title.toLowerCase().includes(filters.jobCategory.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.jobCategory.toLowerCase())
      );
    }

    if (filters.visaSponsorship) {
      filtered = filtered.filter(job => job.visaSponsorship);
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(job =>
        filters.skills.some(skill =>
          job.skills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setJobs(filtered);
    if (!loading) {
      toast.success(`Found ${filtered.length} jobs matching your criteria`);
    }
  };

  const handleSearch = () => {
    fetchJobs();
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

  // Worker Portal Layout
  if (role === 'worker') {
    return (
      <div className="flex min-h-screen bg-background">
        <WorkerSidebar />
        <div className="flex-1 flex flex-col">
          <WorkerHeader />
          <main className="flex-1 p-8">
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
                
                <Card className="mt-4 p-4">
                  <Link to="/worker/saved-searches">
                    <Button variant="outline" className="w-full">
                      View Saved Searches
                    </Button>
                  </Link>
                </Card>
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

                {loading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading jobs...</p>
                  </Card>
                ) : (
                  <>
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
                      <div className="flex gap-2">
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Button onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Please login as a worker to apply for jobs');
                            navigate('/auth');
                          } else {
                            navigate(`/jobs/${job.id}`);
                          }
                        }}>
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {jobs.length === 0 && (
                  <Card className="p-12 text-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to see more results
                    </p>
                  </Card>
                )}
              </>
            )}
              </div>
            </div>
          </main>
        </div>

        <SavedSearchDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          onSave={handleSaveSearch}
        />
      </div>
    );
  }

  // Default Public Layout
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <MobileBottomNav />
      
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

            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading jobs...</p>
              </Card>
            ) : (
              <>
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
                  <div className="flex gap-2">
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Button onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please login as a worker to apply for jobs');
                        navigate('/auth');
                      } else {
                        navigate(`/jobs/${job.id}`);
                      }
                    }}>
                      Apply Now
                    </Button>
                  </div>
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
          </>
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
