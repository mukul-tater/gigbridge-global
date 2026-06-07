import DashboardLayout from "@/components/layout/DashboardLayout";
import { workerNavGroups, workerProfileMenu } from "@/config/workerNav";
import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Trash2 } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import WorkerVideoUpload from "@/components/worker/WorkerVideoUpload";
import ChangePasswordCard from "@/components/ChangePasswordCard";
import { workerProfileSchema, type WorkerProfileFormData } from "@/lib/validations/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileSkeleton } from "@/components/ui/page-skeleton";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactNode } from "react";

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-md overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-cyan-500" />
      <div className="p-6">
        <h2 className="text-lg font-semibold font-heading">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground mt-1 mb-5">{description}</p>
        ) : (
          <div className="mb-5" />
        )}
        {children}
      </div>
    </Card>
  );
}

interface WorkerVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  skills_demonstrated: string[] | null;
  views_count: number | null;
  created_at: string | null;
}

const NATIONALITIES = [
  'India', 'Bangladesh', 'Pakistan', 'Nepal', 'Sri Lanka', 'Philippines',
  'Indonesia', 'Vietnam', 'Thailand', 'Myanmar', 'Malaysia', 'Egypt',
  'Nigeria', 'Kenya', 'Ethiopia', 'Other'
];

export default function WorkerProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<WorkerVideo[]>([]);
  const [nationality, setNationality] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<WorkerProfileFormData>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      bio: '',
      skills: '',
      experience_years: 0,
      certifications: '',
      passport_number: '',
      visa_type: '',
      preferred_countries: '',
      expected_salary_min: 0,
      expected_salary_max: 0,
    }
  });

  const fetchVideos = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('worker_videos')
      .select('*')
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVideos(data);
    }
  }, [user]);

  useEffect(() => {
    const loadWorkerProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Load worker profile data
        const { data: workerProfile, error } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Set form values from profiles table
        if (profile) {
          setValue('full_name', profile.full_name || '');
          setValue('phone', profile.phone || '');
        }

        // Set form values from worker_profiles table
        if (workerProfile) {
          setValue('bio', workerProfile.bio || '');
          setValue('experience_years', workerProfile.years_of_experience || 0);
          setValue('passport_number', workerProfile.passport_number || '');
          setValue('expected_salary_min', workerProfile.expected_salary_min || 0);
          setValue('expected_salary_max', workerProfile.expected_salary_max || 0);
          setNationality(workerProfile.nationality || '');
          
          // Map languages array to skills field (Primary Skills)
          setValue('skills', workerProfile.languages?.join(', ') || '');
          
          // Map visa_countries array to preferred_countries field
          setValue('preferred_countries', workerProfile.visa_countries?.join(', ') || '');
          
          setValue('certifications', '');
          setValue('visa_type', workerProfile.ecr_category || '');
        }

        // Fetch existing resume from worker_documents
        const { data: docs } = await supabase
          .from('worker_documents')
          .select('file_url, document_name')
          .eq('worker_id', user.id)
          .eq('document_type', 'resume')
          .order('uploaded_at', { ascending: false })
          .limit(1);

        if (docs && docs.length > 0) {
          setResumeUrl(docs[0].file_url);
          setResumeName(docs[0].document_name);
        }
      } catch (error) {
        console.error('Error loading worker profile:', error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadWorkerProfile();
    fetchVideos();
  }, [user, profile, setValue, fetchVideos]);

  const onSubmit = async (data: WorkerProfileFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Upsert worker_profiles table
      const { error: workerError } = await supabase
        .from('worker_profiles')
        .upsert({
          user_id: user.id,
          bio: data.bio || null,
          years_of_experience: data.experience_years || null,
          passport_number: data.passport_number || null,
          expected_salary_min: data.expected_salary_min || null,
          expected_salary_max: data.expected_salary_max || null,
          languages: data.skills ? data.skills.split(',').map(s => s.trim()) : null,
          ecr_category: data.visa_type || null,
          visa_countries: data.preferred_countries ? data.preferred_countries.split(',').map(c => c.trim()) : null,
          nationality: nationality || null,
          has_passport: !!data.passport_number,
        }, {
          onConflict: 'user_id'
        });

      if (workerError) throw workerError;

      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUploadComplete = async (url: string) => {
    await refreshProfile();
  };

  const layout = (content: ReactNode) => (
    <DashboardLayout
      navGroups={workerNavGroups}
      portalLabel="Worker Portal"
      portalName="Worker Portal"
      profileMenuItems={workerProfileMenu}
    >
      {content}
    </DashboardLayout>
  );

  if (!user || !profile || loading) {
    return layout(<ProfileSkeleton />);
  }

  return layout(
    <>
      <PortalBreadcrumb />
      <OnboardingStepper />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Keep your details up to date so employers can find and shortlist you faster.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        <ProfileSection title="Profile Picture" description="A clear photo helps employers trust your application.">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            userId={user.id}
            onUploadComplete={handleAvatarUploadComplete}
            fallbackText={profile.full_name?.[0] || 'W'}
          />
        </ProfileSection>

        <WorkerVideoUpload workerId={user.id} videos={videos} onVideosChange={fetchVideos} />

        <ProfileSection
          title="Personal Information"
          description="Basic contact details used across your worker account."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                className={`mt-1.5 h-11 ${errors.full_name ? 'border-destructive' : ''}`}
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="mt-1.5 h-11 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                className={`mt-1.5 h-11 ${errors.phone ? 'border-destructive' : ''}`}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((nat) => (
                    <SelectItem key={nat} value={nat}>
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Required for ECR status determination</p>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell employers about your experience and strengths..."
                className={`mt-1.5 ${errors.bio ? 'border-destructive' : ''}`}
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Resume / CV"
          description="Upload your resume to attach it when applying for jobs."
        >
          {resumeUrl ? (
            <div className="flex items-center justify-between gap-3 p-4 bg-muted/40 rounded-lg border border-border/60">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{resumeName || 'Resume'}</p>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View file
                  </a>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await supabase
                      .from('worker_documents')
                      .delete()
                      .eq('worker_id', user.id)
                      .eq('document_type', 'resume');
                    setResumeUrl(null);
                    setResumeName(null);
                    toast.success('Resume removed');
                  } catch {
                    toast.error('Failed to remove resume');
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : null}
          <div className={resumeUrl ? 'mt-4' : ''}>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={uploadingResume}
              className="cursor-pointer h-11"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                setUploadingResume(true);
                try {
                  const ext = file.name.split('.').pop();
                  const path = `${user.id}/${Date.now()}-resume.${ext}`;
                  const { error: upErr } = await supabase.storage
                    .from('worker-documents')
                    .upload(path, file);
                  if (upErr) throw upErr;
                  const { data: urlData } = supabase.storage
                    .from('worker-documents')
                    .getPublicUrl(path);

                  await supabase
                    .from('worker_documents')
                    .delete()
                    .eq('worker_id', user.id)
                    .eq('document_type', 'resume');

                  await supabase.from('worker_documents').insert({
                    worker_id: user.id,
                    document_type: 'resume',
                    document_name: file.name,
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                  });

                  setResumeUrl(urlData.publicUrl);
                  setResumeName(file.name);
                  toast.success('Resume uploaded successfully!');
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Failed to upload resume';
                  toast.error(message);
                } finally {
                  setUploadingResume(false);
                }
              }}
            />
            {uploadingResume && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX (max 10MB)</p>
          </div>
        </ProfileSection>

        <ProfileSection title="Skills & Experience">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="skills">Primary Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Welding, Electrical, Plumbing"
                className={`mt-1.5 h-11 ${errors.skills ? 'border-destructive' : ''}`}
                {...register('skills')}
              />
              {errors.skills && (
                <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                placeholder="5"
                className={`mt-1.5 h-11 ${errors.experience_years ? 'border-destructive' : ''}`}
                {...register('experience_years', { valueAsNumber: true })}
              />
              {errors.experience_years && (
                <p className="text-sm text-destructive mt-1">{errors.experience_years.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                rows={3}
                placeholder="List your certifications..."
                className={`mt-1.5 ${errors.certifications ? 'border-destructive' : ''}`}
                {...register('certifications')}
              />
              {errors.certifications && (
                <p className="text-sm text-destructive mt-1">{errors.certifications.message}</p>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Immigration Documents">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="passport_number">Passport Number</Label>
              <Input
                id="passport_number"
                placeholder="Enter passport number"
                className={`mt-1.5 h-11 ${errors.passport_number ? 'border-destructive' : ''}`}
                {...register('passport_number')}
              />
              {errors.passport_number && (
                <p className="text-sm text-destructive mt-1">{errors.passport_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="visa_type">Visa Type</Label>
              <Input
                id="visa_type"
                placeholder="e.g., Work Visa, Employment Visa"
                className={`mt-1.5 h-11 ${errors.visa_type ? 'border-destructive' : ''}`}
                {...register('visa_type')}
              />
              {errors.visa_type && (
                <p className="text-sm text-destructive mt-1">{errors.visa_type.message}</p>
              )}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Work Preferences">
          <div className="space-y-4">
            <div>
              <Label htmlFor="preferred_countries">Preferred Countries</Label>
              <Input
                id="preferred_countries"
                placeholder="e.g., UAE, Qatar, Saudi Arabia, Kuwait"
                className={`mt-1.5 h-11 ${errors.preferred_countries ? 'border-destructive' : ''}`}
                {...register('preferred_countries')}
              />
              {errors.preferred_countries && (
                <p className="text-sm text-destructive mt-1">{errors.preferred_countries.message}</p>
              )}
            </div>

            <div>
              <Label>Expected Salary Range (USD/month)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1.5">
                <Input
                  type="number"
                  placeholder="Min"
                  className={`h-11 ${errors.expected_salary_min ? 'border-destructive' : ''}`}
                  {...register('expected_salary_min', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  className={`h-11 ${errors.expected_salary_max ? 'border-destructive' : ''}`}
                  {...register('expected_salary_max', { valueAsNumber: true })}
                />
              </div>
              {(errors.expected_salary_min || errors.expected_salary_max) && (
                <p className="text-sm text-destructive mt-1">
                  {errors.expected_salary_min?.message || errors.expected_salary_max?.message}
                </p>
              )}
            </div>
          </div>
        </ProfileSection>

        <Card className="border-border/60 shadow-md p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={saving} className="h-11 flex-1 font-medium">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:w-32"
              onClick={() => reset()}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </Card>
      </form>

      <div className="max-w-4xl mt-6">
        <ChangePasswordCard />
      </div>
    </>,
  );
}
