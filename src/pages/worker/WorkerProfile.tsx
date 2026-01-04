import { useState, useEffect, useCallback } from 'react';
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import WorkerVideoUpload from "@/components/worker/WorkerVideoUpload";
import { workerProfileSchema, type WorkerProfileFormData } from "@/lib/validations/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileSkeleton } from "@/components/ui/page-skeleton";

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

export default function WorkerProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<WorkerVideo[]>([]);

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
          
          // Map languages array to skills field (Primary Skills)
          setValue('skills', workerProfile.languages?.join(', ') || '');
          
          // Map visa_countries array to preferred_countries field
          setValue('preferred_countries', workerProfile.visa_countries?.join(', ') || '');
          
          setValue('certifications', '');
          setValue('visa_type', workerProfile.ecr_category || '');
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

  if (!user || !profile || loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <WorkerSidebar />
        <div className="flex-1 flex flex-col">
          <WorkerHeader />
          <main className="flex-1 p-8">
            <ProfileSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col">
        <WorkerHeader />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
          {/* Avatar Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              userId={user.id}
              onUploadComplete={handleAvatarUploadComplete}
              fallbackText={profile.full_name?.[0] || 'W'}
            />
          </Card>

          {/* Video Portfolio */}
          <WorkerVideoUpload
            workerId={user.id}
            videos={videos}
            onVideosChange={fetchVideos}
          />

          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  className={errors.full_name ? 'border-destructive' : ''}
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
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1234567890"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className={errors.bio ? 'border-destructive' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Skills & Experience */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills & Experience</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skills">Primary Skills</Label>
                <Input
                  id="skills"
                  {...register('skills')}
                  placeholder="e.g., Welding, Electrical, Plumbing"
                  className={errors.skills ? 'border-destructive' : ''}
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
                  {...register('experience_years', { valueAsNumber: true })}
                  placeholder="5"
                  className={errors.experience_years ? 'border-destructive' : ''}
                />
                {errors.experience_years && (
                  <p className="text-sm text-destructive mt-1">{errors.experience_years.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  {...register('certifications')}
                  rows={3}
                  placeholder="List your certifications..."
                  className={errors.certifications ? 'border-destructive' : ''}
                />
                {errors.certifications && (
                  <p className="text-sm text-destructive mt-1">{errors.certifications.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Immigration Documents */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Immigration Documents</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="passport_number">Passport Number</Label>
                <Input
                  id="passport_number"
                  {...register('passport_number')}
                  placeholder="Enter passport number"
                  className={errors.passport_number ? 'border-destructive' : ''}
                />
                {errors.passport_number && (
                  <p className="text-sm text-destructive mt-1">{errors.passport_number.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="visa_type">Visa Type</Label>
                <Input
                  id="visa_type"
                  {...register('visa_type')}
                  placeholder="e.g., Work Visa, Employment Visa"
                  className={errors.visa_type ? 'border-destructive' : ''}
                />
                {errors.visa_type && (
                  <p className="text-sm text-destructive mt-1">{errors.visa_type.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Work Preferences */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Preferences</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferred_countries">Preferred Countries</Label>
                <Input
                  id="preferred_countries"
                  {...register('preferred_countries')}
                  placeholder="e.g., UAE, Qatar, Saudi Arabia, Kuwait"
                  className={errors.preferred_countries ? 'border-destructive' : ''}
                />
                {errors.preferred_countries && (
                  <p className="text-sm text-destructive mt-1">{errors.preferred_countries.message}</p>
                )}
              </div>

              <div>
                <Label>Expected Salary Range (USD/month)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      {...register('expected_salary_min', { valueAsNumber: true })}
                      placeholder="Min"
                      className={errors.expected_salary_min ? 'border-destructive' : ''}
                    />
                    {errors.expected_salary_min && (
                      <p className="text-sm text-destructive mt-1">{errors.expected_salary_min.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register('expected_salary_max', { valueAsNumber: true })}
                      placeholder="Max"
                      className={errors.expected_salary_max ? 'border-destructive' : ''}
                    />
                    {errors.expected_salary_max && (
                      <p className="text-sm text-destructive mt-1">{errors.expected_salary_max.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </form>
      </main>
      </div>
    </div>
  );
}
