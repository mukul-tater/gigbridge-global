import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDataService } from '@/services/MockDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Briefcase, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import type { Job, Company, Factory } from '@/types/mock-data';

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

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
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
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
