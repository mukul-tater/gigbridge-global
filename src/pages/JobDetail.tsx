import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Building2, Briefcase, IndianRupee, Clock, 
  CheckCircle2, ArrowLeft, Users 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  job_skills: { skill_name: string }[];
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobData | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        // Fetch job with skills
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            job_skills (skill_name)
          `)
          .eq('id', id)
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

        // Check if user has already applied
        if (user) {
          const { data: application } = await supabase
            .from('job_applications')
            .select('id')
            .eq('worker_id', user.id)
            .eq('job_id', id)
            .maybeSingle();

          setHasApplied(!!application);
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, user, navigate, toast]);

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

    if (!user) return;
    if (!job) return;

    setApplying(true);

    try {
      // Create application in database
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

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link to="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>

          {/* Job Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-sm">
                      {job.job_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    <span className="text-lg">SafeWork Global</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>SafeWork Global</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}, {job.country}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.job_type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="h-4 w-4" />
                  <span className="font-semibold">
                    {job.currency} {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.openings} openings</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={handleApply}
                disabled={hasApplied || applying || job.status !== 'ACTIVE' || !isAuthenticated}
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
              
              {hasApplied && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    You have already applied for this position. The employer will review your application.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{job.responsibilities}</p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{job.benefits}</p>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {job.job_skills && job.job_skills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.job_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.skill_name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">SafeWork Global</h4>
                <p className="text-muted-foreground text-sm">
                  Leading workforce solutions provider connecting skilled workers with global opportunities.
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Industry</span>
                  <p className="font-medium">Manufacturing & Construction</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size</span>
                  <p className="font-medium">1000-5000 employees</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Founded</span>
                  <p className="font-medium">2010</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Visa Sponsorship</span>
                  <p className="font-medium">{job.visa_sponsorship ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
