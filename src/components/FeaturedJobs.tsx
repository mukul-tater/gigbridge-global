import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Briefcase, DollarSign, Clock, ArrowRight, Bookmark, Share2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeaturedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  job_type: string;
  visa_sponsorship: boolean;
  posted_at: string;
  employer_profiles?: {
    company_name: string;
  } | null;
  job_skills: {
    skill_name: string;
  }[];
}

export default function FeaturedJobs() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            employer_profiles!jobs_employer_id_fkey (company_name),
            job_skills (skill_name)
          `)
          .eq('status', 'ACTIVE')
          .order('posted_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setJobs((data as any) || []);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const formatSalary = (min: number, max: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${(min / 1000).toFixed(0)}K - ₹${(max / 1000).toFixed(0)}K`;
    }
    return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
  };

  const getJobTypeBadge = (type: string) => {
    const variants = {
      'FULL_TIME': 'default',
      'PART_TIME': 'secondary',
      'CONTRACT': 'outline'
    } as const;
    return variants[type as keyof typeof variants] || 'default';
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast({
        title: "Job removed",
        description: "Job removed from your saved list",
      });
    } else {
      newSavedJobs.add(jobId);
      toast({
        title: "Job saved!",
        description: "Job added to your saved list",
      });
    }
    setSavedJobs(newSavedJobs);
  };

  const handleShareJob = async (job: FeaturedJob) => {
    const shareData = {
      title: job.title,
      text: `Check out this job: ${job.title} at ${job.employer_profiles?.company_name || 'Company'}`,
      url: window.location.origin + '/jobs/' + job.id,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Job has been shared",
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link copied!",
        description: "Job link copied to clipboard",
      });
    }
  };

  const handleQuickApply = (jobId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to apply for jobs",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-background" id="jobs">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading featured jobs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background" id="jobs">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Opportunities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our latest job openings from verified employers worldwide
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <Card key={job.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  {/* Quick Action Buttons */}
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-md hover:scale-110 transition-transform"
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <Bookmark 
                        className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} 
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-md hover:scale-110 transition-transform"
                      onClick={() => handleShareJob(job)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getJobTypeBadge(job.job_type)}>
                        {job.job_type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {getDaysAgo(job.posted_at)}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4" />
                      {job.employer_profiles?.company_name || 'Company'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}, {job.country}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary_min, job.salary_max, job.currency)}
                    </div>

                    {job.visa_sponsorship && (
                      <Badge variant="secondary" className="w-fit">
                        <Zap className="h-3 w-3 mr-1" />
                        Visa Sponsorship
                      </Badge>
                    )}

                    {job.job_skills && job.job_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.job_skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/jobs/${job.id}`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        className="flex-1" 
                        onClick={() => handleQuickApply(job.id)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button size="lg" variant="hero">
                  View All Jobs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
