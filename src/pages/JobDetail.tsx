import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockDataService } from '@/services/MockDataService';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Building2, Briefcase, IndianRupee, Clock, 
  CheckCircle2, ArrowLeft, Calendar, Users 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Job, Company, Factory, Skill, Application } from '@/types/mock-data';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await mockDataService.initialize();
      
      if (!id) return;
      
      const jobData = mockDataService.getJobById(id);
      if (!jobData) {
        navigate('/jobs');
        return;
      }
      
      setJob(jobData);
      setCompany(mockDataService.getCompanyById(jobData.companyId) || null);
      setFactory(mockDataService.getFactoryById(jobData.factoryId) || null);
      
      const jobSkills = jobData.requiredSkills
        .map(skillId => mockDataService.getSkillById(skillId))
        .filter((s): s is Skill => s !== undefined);
      setSkills(jobSkills);
      
      // Check if user has already applied
      if (user && user.role === 'WORKER') {
        const workerProfile = mockDataService.getWorkerByUserId(user.id);
        if (workerProfile) {
          const existingApp = mockDataService.getApplicationByWorkerAndJob(workerProfile.id, id);
          setHasApplied(!!existingApp);
        }
      }
    };
    
    loadData();
  }, [id, user, navigate]);

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

    if (!user || user.role !== 'WORKER') {
      toast({
        title: 'Worker Account Required',
        description: 'Only worker accounts can apply for jobs',
        variant: 'destructive'
      });
      return;
    }

    if (!job) return;

    setApplying(true);

    // Get worker profile
    const workerProfile = mockDataService.getWorkerByUserId(user.id);
    if (!workerProfile) {
      toast({
        title: 'Profile Required',
        description: 'Please complete your worker profile first',
        variant: 'destructive'
      });
      setApplying(false);
      return;
    }

    // Create application
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      workerId: workerProfile.id,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockDataService.createApplication(newApplication);
    setHasApplied(true);

    toast({
      title: 'Application Submitted!',
      description: 'Your application has been sent to the employer',
    });

    setApplying(false);
  };

  if (!job) {
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

  const formatSalary = (min: number, max: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const getJobTypeBadge = (type: string) => {
    const variants = {
      'FULL_TIME': 'default',
      'PART_TIME': 'secondary',
      'CONTRACT': 'outline'
    } as const;
    return variants[type as keyof typeof variants] || 'default';
  };

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
                    <Badge variant={getJobTypeBadge(job.jobType)} className="text-sm">
                      {job.jobType.replace('_', ' ')}
                    </Badge>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    <span className="text-lg">{company?.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{factory?.city}, {factory?.state}</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <IndianRupee className="h-5 w-5" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasApplied && (
                <Alert className="mb-4 bg-success/10 border-success">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    You have already applied for this position
                  </AlertDescription>
                </Alert>
              )}

              {!hasApplied && (
                <Button 
                  size="lg" 
                  className="w-full md:w-auto"
                  onClick={handleApply}
                  disabled={applying || job.status !== 'ACTIVE'}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {skills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill.id} variant="secondary" className="text-sm">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Headquarters</h4>
                    <p className="text-sm text-muted-foreground">
                      {company.headquarters.city}, {company.headquarters.state}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Contact</h4>
                    <p className="text-sm text-muted-foreground">{company.contactEmail}</p>
                    <p className="text-sm text-muted-foreground">{company.contactPhone}</p>
                  </div>
                </div>
                {company.verified && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Verified Employer</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
