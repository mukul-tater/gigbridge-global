import { useState, useEffect } from 'react';
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EmployerProfileData {
  company_name: string;
  company_registration: string;
  industry: string;
  company_size: string;
  website: string;
  bio: string;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EmployerProfileData>({
    company_name: '',
    company_registration: '',
    industry: '',
    company_size: '',
    website: '',
    bio: ''
  });

  useEffect(() => {
    loadCompanyProfile();
  }, [user]);

  const loadCompanyProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('employer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          company_name: (data as any).company_name || '',
          company_registration: (data as any).company_registration || '',
          industry: (data as any).industry || '',
          company_size: (data as any).company_size || '',
          website: (data as any).website || '',
          bio: (data as any).bio || ''
        });
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await (supabase as any)
        .from('employer_profiles')
        .upsert({
          user_id: user.id,
          ...formData
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Company profile updated successfully!");
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast.error("Failed to update company profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EmployerProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadDocument = () => {
    toast.success("Document uploaded successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Company Profile & KYC</h1>
          <p className="text-muted-foreground">Manage your company information and verification status</p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* KYC Verification Status */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">KYC Verification Status</h2>
                <p className="text-sm text-muted-foreground">Company verification is required to post jobs</p>
              </div>
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Company Registration</span>
                </div>
                <span className="text-xs text-green-700">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Tax Documents</span>
                </div>
                <span className="text-xs text-green-700">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Trade License</span>
                </div>
                <span className="text-xs text-green-700">Verified</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input 
                  id="company_name"
                  value={formData.company_name} 
                  onChange={(e) => handleChange('company_name', e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_registration">Registration Number</Label>
                  <Input 
                    id="company_registration"
                    value={formData.company_registration} 
                    onChange={(e) => handleChange('company_registration', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry Type</Label>
                  <Input 
                    id="industry"
                    value={formData.industry} 
                    onChange={(e) => handleChange('industry', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input 
                    id="company_size"
                    value={formData.company_size} 
                    onChange={(e) => handleChange('company_size', e.target.value)}
                    placeholder="e.g., 50-100 employees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year Established</label>
                  <Input type="number" defaultValue="2015" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Description</label>
                <Textarea rows={4} placeholder="Tell us about your company..." defaultValue="Leading steel manufacturing company with operations across Middle East and Asia" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Contact Details</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <Input type="email" defaultValue="hr@shreefab.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <Input defaultValue="+971-4-1234567" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Headquarters Address</label>
                <Textarea rows={3} defaultValue="Dubai Investment Park, Plot 597-123, Dubai, UAE" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <Input type="url" placeholder="https://www.company.com" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Legal Documents</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload company verification documents</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Trade License</p>
                  <p className="text-sm text-muted-foreground">trade_license.pdf</p>
                </div>
                <Badge className="bg-green-500">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Company Registration Certificate</p>
                  <p className="text-sm text-muted-foreground">registration_cert.pdf</p>
                </div>
                <Badge className="bg-green-500">Verified</Badge>
              </div>
              <Button variant="outline" onClick={handleUploadDocument} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Additional Document
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Escrow Account</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Escrow Status</p>
                  <p className="text-sm text-muted-foreground">Secure payment account for worker salaries</p>
                </div>
                <Badge className="bg-primary">Active</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">$25,000 USD</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium text-green-600">Active & Verified</p>
                </div>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </main>
      </div>
    </div>
  );
}
