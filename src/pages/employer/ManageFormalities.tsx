import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import EmployerSidebar from '@/components/employer/EmployerSidebar';
import EmployerHeader from '@/components/employer/EmployerHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  FileCheck, Plane, Shield, Heart, FileSignature, Calendar,
  User, Briefcase, MapPin
} from 'lucide-react';

interface Formality {
  id: string;
  application_id: string;
  worker_id: string;
  job_id: string;
  visa_status: string;
  visa_required: boolean;
  ecr_check_status: string;
  ecr_check_required: boolean;
  medical_exam_status: string;
  medical_exam_required: boolean;
  police_verification_status: string;
  police_verification_required: boolean;
  contract_signed: boolean;
  flight_booking_status: string;
  completion_percentage: number;
  expected_joining_date: string | null;
  job_applications: {
    profiles: {
      full_name: string | null;
      email: string;
    };
    jobs: {
      title: string;
      location: string;
    };
  };
}

export default function ManageFormalities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formalities, setFormalities] = useState<Formality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormality, setSelectedFormality] = useState<Formality | null>(null);
  const [updateData, setUpdateData] = useState<any>({});

  useEffect(() => {
    if (user) {
      fetchFormalities();
    }
  }, [user]);

  const fetchFormalities = async () => {
    try {
      const { data, error } = await supabase
        .from('job_formalities')
        .select(`
          *,
          job_applications!inner (
            profiles!job_applications_worker_id_fkey (full_name, email),
            jobs!inner (title, location)
          )
        `)
        .eq('job_applications.jobs.employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormalities((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormality = async (formalityId: string, updates: any) => {
    try {
      // Calculate completion percentage
      const formality = formalities.find(f => f.id === formalityId);
      if (!formality) return;

      let completedItems = 0;
      let totalItems = 0;

      if (formality.visa_required) {
        totalItems++;
        if (updates.visa_status === 'COMPLETED' || formality.visa_status === 'COMPLETED') completedItems++;
      }
      if (formality.ecr_check_required) {
        totalItems++;
        if (updates.ecr_check_status === 'COMPLETED' || formality.ecr_check_status === 'COMPLETED') completedItems++;
      }
      if (formality.medical_exam_required) {
        totalItems++;
        if (updates.medical_exam_status === 'COMPLETED' || formality.medical_exam_status === 'COMPLETED') completedItems++;
      }
      if (formality.police_verification_required) {
        totalItems++;
        if (updates.police_verification_status === 'COMPLETED' || formality.police_verification_status === 'COMPLETED') completedItems++;
      }
      totalItems++; // Contract
      if (updates.contract_signed || formality.contract_signed) completedItems++;
      
      totalItems++; // Flight
      if (updates.flight_booking_status === 'COMPLETED' || formality.flight_booking_status === 'COMPLETED') completedItems++;

      const percentage = Math.round((completedItems / totalItems) * 100);

      const { error } = await supabase
        .from('job_formalities')
        .update({ 
          ...updates, 
          completion_percentage: percentage,
          overall_status: percentage === 100 ? 'COMPLETED' : 'IN_PROGRESS'
        })
        .eq('id', formalityId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Formality updated successfully',
      });

      fetchFormalities();
      setSelectedFormality(null);
      setUpdateData({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <EmployerHeader />
        <div className="flex flex-1">
          <EmployerSidebar />
          <main className="p-6">
            <p>Loading formalities...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Manage Post-Approval Formalities</h1>
            <p className="text-muted-foreground">
              Track and manage visa, ECR, medical, and other formalities for approved candidates
            </p>
          </div>

          <div className="grid gap-4">
            {formalities.length === 0 ? (
              <Card className="p-12 text-center">
                <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Formalities to Manage</h3>
                <p className="text-muted-foreground">
                  Formalities will appear here once you approve job applications
                </p>
              </Card>
            ) : (
              formalities.map((formality) => (
                <Card key={formality.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {formality.job_applications.jobs.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {formality.job_applications.profiles.full_name || formality.job_applications.profiles.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {formality.job_applications.jobs.location}
                          </span>
                        </div>
                      </div>
                      <Badge variant={formality.completion_percentage === 100 ? 'default' : 'secondary'}>
                        {formality.completion_percentage}% Complete
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <Progress value={formality.completion_percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {formality.visa_required && (
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Visa</p>
                            <Badge variant="outline" className="text-xs">
                              {formality.visa_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {formality.ecr_check_required && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">ECR</p>
                            <Badge variant="outline" className="text-xs">
                              {formality.ecr_check_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {formality.medical_exam_required && (
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Medical</p>
                            <Badge variant="outline" className="text-xs">
                              {formality.medical_exam_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {formality.police_verification_required && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Police Verification</p>
                            <Badge variant="outline" className="text-xs">
                              {formality.police_verification_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <FileSignature className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Contract</p>
                          <Badge variant="outline" className="text-xs">
                            {formality.contract_signed ? 'SIGNED' : 'PENDING'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Flight</p>
                          <Badge variant="outline" className="text-xs">
                            {formality.flight_booking_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setSelectedFormality(formality);
                            setUpdateData({});
                          }}
                        >
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Update Formality Status</DialogTitle>
                        </DialogHeader>

                        {selectedFormality && (
                          <div className="space-y-4">
                            {selectedFormality.visa_required && (
                              <div className="space-y-2">
                                <Label>Visa Status</Label>
                                <Select
                                  value={updateData.visa_status || selectedFormality.visa_status}
                                  onValueChange={(value) => setUpdateData({ ...updateData, visa_status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {selectedFormality.ecr_check_required && (
                              <div className="space-y-2">
                                <Label>ECR Check Status</Label>
                                <Select
                                  value={updateData.ecr_check_status || selectedFormality.ecr_check_status}
                                  onValueChange={(value) => setUpdateData({ ...updateData, ecr_check_status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {selectedFormality.medical_exam_required && (
                              <div className="space-y-2">
                                <Label>Medical Exam Status</Label>
                                <Select
                                  value={updateData.medical_exam_status || selectedFormality.medical_exam_status}
                                  onValueChange={(value) => setUpdateData({ ...updateData, medical_exam_status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {selectedFormality.police_verification_required && (
                              <div className="space-y-2">
                                <Label>Police Verification Status</Label>
                                <Select
                                  value={updateData.police_verification_status || selectedFormality.police_verification_status}
                                  onValueChange={(value) => setUpdateData({ ...updateData, police_verification_status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Contract Signed</Label>
                              <Select
                                value={updateData.contract_signed !== undefined ? String(updateData.contract_signed) : String(selectedFormality.contract_signed)}
                                onValueChange={(value) => setUpdateData({ ...updateData, contract_signed: value === 'true' })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="false">Not Signed</SelectItem>
                                  <SelectItem value="true">Signed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Flight Booking Status</Label>
                              <Select
                                value={updateData.flight_booking_status || selectedFormality.flight_booking_status}
                                onValueChange={(value) => setUpdateData({ ...updateData, flight_booking_status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Expected Joining Date</Label>
                              <Input
                                type="date"
                                value={updateData.expected_joining_date || selectedFormality.expected_joining_date || ''}
                                onChange={(e) => setUpdateData({ ...updateData, expected_joining_date: e.target.value })}
                              />
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => updateFormality(selectedFormality.id, updateData)}
                            >
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
