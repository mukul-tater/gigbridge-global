import { useState, useEffect } from 'react';
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

interface Worker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  nationality: string | null;
  current_location: string | null;
  years_of_experience: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string;
  availability: string | null;
  has_passport: boolean;
  has_visa: boolean;
  skills: Array<{ skill_name: string }>;
}

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
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          worker_profiles!inner (
            nationality,
            current_location,
            years_of_experience,
            expected_salary_min,
            expected_salary_max,
            currency,
            availability,
            has_passport,
            has_visa
          ),
          worker_skills (
            skill_name
          )
        `);

      if (error) throw error;

      const formattedWorkers = data?.map((worker: any) => ({
        id: worker.id,
        full_name: worker.full_name,
        avatar_url: worker.avatar_url,
        nationality: worker.worker_profiles?.nationality,
        current_location: worker.worker_profiles?.current_location,
        years_of_experience: worker.worker_profiles?.years_of_experience,
        expected_salary_min: worker.worker_profiles?.expected_salary_min,
        expected_salary_max: worker.worker_profiles?.expected_salary_max,
        currency: worker.worker_profiles?.currency || 'USD',
        availability: worker.worker_profiles?.availability,
        has_passport: worker.worker_profiles?.has_passport || false,
        has_visa: worker.worker_profiles?.has_visa || false,
        skills: worker.worker_skills || []
      })) || [];

      setWorkers(formattedWorkers);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          worker_profiles!inner (
            nationality,
            current_location,
            years_of_experience,
            expected_salary_min,
            expected_salary_max,
            currency,
            availability,
            has_passport,
            has_visa
          ),
          worker_skills (
            skill_name
          )
        `);

      // Apply filters
      if (filters.keyword) {
        query = query.or(`full_name.ilike.%${filters.keyword}%`);
      }

      if (filters.nationality && filters.nationality !== 'All Nationalities') {
        query = query.eq('worker_profiles.nationality', filters.nationality);
      }

      if (filters.hasPassport) {
        query = query.eq('worker_profiles.has_passport', true);
      }

      if (filters.hasVisa) {
        query = query.eq('worker_profiles.has_visa', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filtered = data?.map((worker: any) => ({
        id: worker.id,
        full_name: worker.full_name,
        avatar_url: worker.avatar_url,
        nationality: worker.worker_profiles?.nationality,
        current_location: worker.worker_profiles?.current_location,
        years_of_experience: worker.worker_profiles?.years_of_experience,
        expected_salary_min: worker.worker_profiles?.expected_salary_min,
        expected_salary_max: worker.worker_profiles?.expected_salary_max,
        currency: worker.worker_profiles?.currency || 'USD',
        availability: worker.worker_profiles?.availability,
        has_passport: worker.worker_profiles?.has_passport || false,
        has_visa: worker.worker_profiles?.has_visa || false,
        skills: worker.worker_skills || []
      })) || [];

      // Client-side filtering for complex conditions
      if (filters.skills.length > 0) {
        filtered = filtered.filter((worker: Worker) =>
          filters.skills.some(skill => 
            worker.skills.some(s => s.skill_name === skill)
          )
        );
      }

      filtered = filtered.filter((worker: Worker) =>
        (worker.years_of_experience || 0) >= filters.experienceYears[0] &&
        (worker.years_of_experience || 0) <= filters.experienceYears[1]
      );

      setWorkers(filtered);
      toast.success(`Found ${filtered.length} workers matching your criteria`);
    } catch (error) {
      console.error('Error searching workers:', error);
      toast.error('Failed to search workers');
    } finally {
      setLoading(false);
    }
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
                    <AvatarImage src={worker.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {worker.full_name?.split(' ').map(n => n[0]).join('') || 'W'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{worker.full_name || 'Worker'}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {worker.nationality && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {worker.nationality}
                            </span>
                          )}
                          {worker.current_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {worker.current_location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {worker.years_of_experience || 0} years
                        </p>
                      </div>
                      {worker.availability && (
                        <div>
                          <p className="text-muted-foreground">Availability</p>
                          <p className="font-semibold">{worker.availability}</p>
                        </div>
                      )}
                      {worker.expected_salary_min && worker.expected_salary_max && (
                        <div>
                          <p className="text-muted-foreground">Expected Salary</p>
                          <p className="font-semibold">
                            {worker.currency} {worker.expected_salary_min.toLocaleString()} - {worker.expected_salary_max.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {worker.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill.skill_name}</Badge>
                      ))}
                      {worker.skills.length > 5 && (
                        <Badge variant="secondary">+{worker.skills.length - 5} more</Badge>
                      )}
                      {worker.has_passport && (
                        <Badge variant="secondary">Valid Passport</Badge>
                      )}
                      {worker.has_visa && (
                        <Badge className="bg-success text-success-foreground">Work Visa</Badge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link to={`/worker-profile/${worker.id}`}>
                        <Button>View Profile</Button>
                      </Link>
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
