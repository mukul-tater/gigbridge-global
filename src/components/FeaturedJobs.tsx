import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Clock, ArrowRight, Bookmark, Share2, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeaturedJob {
  id: string;
  slug: string;
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
    const inrMin = currency === 'INR' ? min : min * 83;
    const inrMax = currency === 'INR' ? max : max * 83;
    return `₹${(inrMin / 1000).toFixed(0)}K - ₹${(inrMax / 1000).toFixed(0)}K`;
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
    return `${days}d ago`;
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast({ title: "Job removed", description: "Job removed from your saved list" });
    } else {
      newSavedJobs.add(jobId);
      toast({ title: "Job saved!", description: "Job added to your saved list" });
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
        toast({ title: "Shared successfully!", description: "Job has been shared" });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link copied!", description: "Job link copied to clipboard" });
    }
  };

  const handleQuickApply = (jobSlug: string) => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please login to apply for jobs", variant: "destructive" });
      navigate('/auth');
      return;
    }
    navigate(`/jobs/${jobSlug}`);
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-32 bg-background" id="jobs">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground">Loading featured jobs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden" id="jobs">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 bg-mesh opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-secondary/10 text-secondary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Hot Opportunities
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold font-heading text-foreground mb-4 tracking-tight">
            Featured <span className="text-gradient">Opportunities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our latest job openings from verified employers worldwide
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-12">
              {jobs.map((job, index) => {
                return (
                  <div
                    key={job.id}
                    className="group opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <Card 
                      className="h-full relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer flex flex-col"
                      onClick={() => navigate(`/jobs/${job.slug || job.id}`)}
                    >
                      {/* Gradient accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-info opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Quick Action Buttons - Always visible */}
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all"
                          onClick={(e) => { e.stopPropagation(); handleSaveJob(job.id); }}
                        >
                          <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-secondary hover:text-secondary-foreground hover:scale-110 transition-all"
                          onClick={(e) => { e.stopPropagation(); handleShareJob(job); }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <CardHeader className="pb-3 pt-14">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={getJobTypeBadge(job.job_type)} className="text-xs font-medium">
                            {job.job_type.replace('_', ' ')}
                          </Badge>
                          <span className="flex items-center text-xs text-muted-foreground ml-auto">
                            <Clock className="h-3 w-3 mr-1" />
                            {getDaysAgo(job.posted_at)}
                          </span>
                        </div>
                        <CardTitle className="text-lg lg:text-xl font-heading line-clamp-1 group-hover:text-primary transition-colors pr-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{job.employer_profiles?.company_name || 'Company'}</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{job.location}, {job.country}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatSalary(job.salary_min, job.salary_max, job.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground">/month</span>
                        </div>

                        {job.visa_sponsorship && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20 w-fit">
                            <Zap className="h-3 w-3 mr-1" />
                            Visa Sponsorship
                          </Badge>
                        )}

                        {job.job_skills && job.job_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {job.job_skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-muted/50">
                                {skill.skill_name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex-1" />
                        
                        <Button 
                          className="w-full mt-auto group/btn rounded-xl"
                          onClick={(e) => { e.stopPropagation(); handleQuickApply(job.slug || job.id); }}
                        >
                          View & Apply
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button size="lg" className="rounded-xl px-8 gap-2 shadow-primary hover:shadow-hover transition-all">
                  View All Jobs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

    </section>
  );
}
