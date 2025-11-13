import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDataService } from '@/services/MockDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Briefcase, IndianRupee, Clock, ArrowRight, Bookmark, Share2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Job, Company, Factory } from '@/types/mock-data';

export default function FeaturedJobs() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      await mockDataService.initialize();
      const activeJobs = mockDataService.getActiveJobs().slice(0, 6);
      setJobs(activeJobs);
      setCompanies(mockDataService.getCompanies());
      setFactories(mockDataService.getFactories());
    };
    loadData();
  }, []);

  const getCompany = (companyId: string) => companies.find(c => c.id === companyId);
  const getFactory = (factoryId: string) => factories.find(f => f.id === factoryId);

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

  const handleShareJob = async (job: Job, company: Company | undefined) => {
    const shareData = {
      title: job.title,
      text: `Check out this job: ${job.title} at ${company?.name || 'Company'}`,
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
      return;
    }
    toast({
      title: "Application started!",
      description: "Redirecting to application form...",
    });
    // Navigate to application would go here
  };

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
              {jobs.map((job) => {
                const company = getCompany(job.companyId);
                const factory = getFactory(job.factoryId);
                
                return (
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
                        onClick={() => handleShareJob(job, company)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getJobTypeBadge(job.jobType)}>
                          {job.jobType.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Building2 className="h-4 w-4" />
                        {company?.name || 'Company'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {factory?.city}, {factory?.state}
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <IndianRupee className="h-4 w-4" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {job.openings} opening{job.openings > 1 ? 's' : ''}
                      </div>

                      <Link to={`/jobs/${job.id}`}>
                        <Button className="w-full mt-4" variant="outline">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
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
