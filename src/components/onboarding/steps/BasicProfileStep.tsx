import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const basicProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Enter phone in E.164 format (e.g., +91XXXXXXXXXX)'),
  email: z.string().email('Please enter a valid email address'),
  profile_photo_url: z.string().optional(),
});

type BasicProfileData = z.infer<typeof basicProfileSchema>;

interface BasicProfileStepProps {
  data: Partial<BasicProfileData>;
  onComplete: (data: BasicProfileData) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

export default function BasicProfileStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: BasicProfileStepProps) {
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.profile_photo_url || null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BasicProfileData>({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: data,
    mode: 'onChange',
  });

  const watchedFields = watch();

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onboardingId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile photo must be under 5MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('onboarding-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('onboarding-documents')
        .getPublicUrl(fileName);

      setValue('profile_photo_url', publicUrl);
      setPhotoPreview(publicUrl);

      toast({
        title: 'Photo uploaded',
        description: 'Profile photo uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setValue('profile_photo_url', '');
    setPhotoPreview(null);
  };

  const onSubmit = (formData: BasicProfileData) => {
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-2">
        <Label>Profile Photo (Optional)</Label>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  onClick={removePhoto}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
                id="photo-upload"
              />
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                JPG or PNG, max 5MB
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth *</Label>
        <Input
          id="date_of_birth"
          type="date"
          {...register('date_of_birth')}
          max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
        {errors.date_of_birth && (
          <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender (Optional)</Label>
        <Select 
          value={watchedFields.gender || ''} 
          onValueChange={(value) => setValue('gender', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="e.g., +91XXXXXXXXXX"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Include country code (e.g., +91 for India)
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={!isValid} className="w-full">
        Save & Continue
      </Button>
    </form>
  );
}