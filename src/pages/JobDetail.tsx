import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Building2, Briefcase, Clock, 
  CheckCircle2, ArrowLeft, Users, Globe, Shield, Calendar,
  Share2, Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { JobDetailSkeleton } from '@/components/ui/page-skeleton';

interface JobData {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  job_type: string;
  status: string;
  employer_id: string;
  experience_level: string;
  benefits: string | null;
  requirements: string | null;
  responsibilities: string | null;
  openings: number;
  visa_sponsorship: boolean;
  posted_at: string;
  slug: string;
  job_skills: { skill_name: string }[];
}

interface EmployerProfile {
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  bio: string | null;
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobData | null>(null);
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      
      try {
        // Fetch job by slug with skills
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            job_skills (skill_name)
          `)
          .eq('slug', slug)
          .single();

        if (jobError || !jobData) {
          toast({
            title: 'Job not found',
            description: 'This job listing does not exist',
            variant: 'destructive'
          });
          navigate('/jobs');
          return;
        }

        setJob(jobData as any);

        // Fetch employer profile
        const { data: employerData } = await supabase
          .from('employer_profiles')
          .select('company_name, industry, company_size, bio')
          .eq('user_id', jobData.employer_id)
          .maybeSingle();

        if (employerData) {
          setEmployer(employerData);
        }

        // Check if user has already applied and if job is saved
        if (user) {
          const { data: application } = await supabase
            .from('job_applications')
            .select('id')
            .eq('worker_id', user.id)
            .eq('job_id', jobData.id)
            .maybeSingle();

          setHasApplied(!!application);

          // Check if job is saved
          const { data: savedJob } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', jobData.id)
            .maybeSingle();

          setIsSaved(!!savedJob);
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [slug, user, navigate, toast]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to apply for jobs',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (role === 'employer') {
      toast({
        title: 'Not Allowed',
        description: 'Employers cannot apply for jobs. You can only post and manage jobs.',
        variant: 'destructive'
      });
      return;
    }

    if (!user || !job) return;

    setApplying(true);

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          worker_id: user.id,
          employer_id: job.employer_id,
          status: 'PENDING',
          cover_letter: 'Application submitted through platform'
        });

      if (error) throw error;

      setHasApplied(true);
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been sent to the employer',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive'
      });
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Job link has been copied to clipboard',
      });
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to save jobs',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!user || !job) return;

    setSaving(true);

    try {
      if (isSaved) {
        // Unsave the job
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: 'Job Removed',
          description: 'Job removed from your saved list',
        });
      } else {
        // Save the job
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            job_id: job.id
          });

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: 'Job Saved',
          description: 'Job added to your saved list',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save job',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <JobDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">This job listing may have been removed or expired.</p>
            <Button onClick={() => navigate('/jobs')}>Browse All Jobs</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const companyName = employer?.company_name || 'SafeWork Global';

  // Structured data for job posting
  const jobStructuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.posted_at,
    "validThrough": new Date(new Date(job.posted_at).setMonth(new Date(job.posted_at).getMonth() + 3)).toISOString(),
    "employmentType": job.job_type.replace('_', ' '),
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
      "description": employer?.bio || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": job.country
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": job.currency,
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "MONTH"
      }
    },
    "experienceRequirements": job.experience_level,
    "qualifications": job.requirements || undefined,
    "responsibilities": job.responsibilities || undefined,
    "skills": job.job_skills?.map(s => s.skill_name).join(', ') || undefined
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${job.title} at ${companyName} | SafeWorkGlobal`}
        description={`Apply for ${job.title} in ${job.location}, ${job.country}. ${job.visa_sponsorship ? 'Visa sponsorship available.' : ''} Salary: ${job.currency} ${job.salary_min}-${job.salary_max}/month.`}
        keywords={`${job.title}, ${job.location} jobs, ${job.country} jobs, ${companyName} careers, ${job.job_skills?.map(s => s.skill_name).join(', ')}`}
        canonicalUrl={`${window.location.origin}/jobs/${job.slug}`}
        ogType="article"
        structuredData={jobStructuredData}
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{job.job_type.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{job.experience_level}</Badge>
                    {job.visa_sponsorship && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Shield className="h-3 w-3 mr-1" />
                        Visa Sponsorship
                      </Badge>
                    )}
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
                  
                  <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">{companyName}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{job.location}, {job.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-bold text-primary">₹</span>
                      <span className="font-semibold text-foreground">
                        {job.currency === 'INR' 
                          ? `₹${job.salary_min?.toLocaleString()} - ₹${job.salary_max?.toLocaleString()}`
                          : `₹${(job.salary_min * 83)?.toLocaleString()} - ₹${(job.salary_max * 83)?.toLocaleString()}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{job.openings} openings</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Posted {format(new Date(job.posted_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.responsibilities}</p>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits & Perks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
                  </CardContent>
                </Card>
              )}

              {/* Required Skills */}
              {job.job_skills && job.job_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.job_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                          {skill.skill_name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  {role === 'employer' ? (
                    <Alert>
                      <AlertDescription>
                        As an employer, you cannot apply for jobs.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast({
                            title: 'Login Required',
                            description: 'Please login as a worker to apply for jobs',
                            variant: 'destructive'
                          });
                          navigate('/auth');
                          return;
                        }
                        handleApply();
                      }}
                      disabled={hasApplied || applying || job.status !== 'ACTIVE'}
                      className="w-full"
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Already Applied
                        </>
                      ) : applying ? (
                        'Submitting...'
                      ) : !isAuthenticated ? (
                        'Login to Apply'
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  )}
                  
                  {hasApplied && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Your application is under review.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${isSaved ? 'bg-primary/10 border-primary text-primary' : ''}`}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Company</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{companyName}</h4>
                      {employer?.industry && (
                        <p className="text-sm text-muted-foreground">{employer.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  {employer?.bio && (
                    <p className="text-sm text-muted-foreground">{employer.bio}</p>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {employer?.company_size && (
                      <div>
                        <span className="text-muted-foreground block">Size</span>
                        <p className="font-medium">{employer.company_size}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block">Visa Support</span>
                      <p className="font-medium">{job.visa_sponsorship ? 'Available' : 'Not Available'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type</span>
                    <span className="font-medium">{job.job_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience Level</span>
                    <span className="font-medium">{job.experience_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Openings</span>
                    <span className="font-medium">{job.openings} positions</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}