import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDataService } from '@/services/MockDataService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building2, Briefcase, IndianRupee, Clock, ArrowRight, Search } from 'lucide-react';
import type { Job, Company, Factory } from '@/types/mock-data';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      await mockDataService.initialize();
      setJobs(mockDataService.getActiveJobs());
      setCompanies(mockDataService.getCompanies());
      setFactories(mockDataService.getFactories());
    };
    loadData();
  }, []);

  const getCompany = (companyId: string) => companies.find(c => c.id === companyId);
  const getFactory = (factoryId: string) => factories.find(f => f.id === factoryId);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || job.jobType === filterType;
    
    return matchesSearch && matchesType;
  });

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
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Browse All Jobs
            </h1>
            <p className="text-lg text-muted-foreground">
              {filteredJobs.length} opportunities available
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title or keyword..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
