import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, X, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const skillSchema = z.object({
  skill_name: z.string().min(1, 'Skill name is required'),
  experience_years: z.number().min(0).max(60, 'Experience must be between 0-60 years'),
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  file_url: z.string().optional(),
});

const skillsStepSchema = z.object({
  skills: z.array(skillSchema).min(1, 'At least one skill is required'),
  certifications: z.array(certificationSchema),
});

type SkillsStepData = z.infer<typeof skillsStepSchema>;

interface SkillsStepProps {
  data: Partial<SkillsStepData>;
  onComplete: (data: SkillsStepData) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

const COMMON_SKILLS = [
  'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mason', 'Painter',
  'HVAC Technician', 'Construction Worker', 'Heavy Equipment Operator',
  'Crane Operator', 'Safety Officer', 'Quality Inspector'
];

export default function SkillsStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState('');
  const [uploading, setUploading] = useState<number | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<SkillsStepData>({
    resolver: zodResolver(skillsStepSchema),
    defaultValues: {
      skills: data.skills || [],
      certifications: data.certifications || [],
    },
    mode: 'onChange',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills',
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'certifications',
  });

  const watchedFields = watch();

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const addSkill = (skillName: string) => {
    if (skillName.trim()) {
      const exists = skillFields.some(field => 
        field.skill_name.toLowerCase() === skillName.toLowerCase()
      );
      
      if (!exists) {
        appendSkill({ skill_name: skillName.trim(), experience_years: 0 });
        setNewSkill('');
      } else {
        toast({
          title: 'Skill already added',
          description: 'This skill is already in your list',
          variant: 'destructive',
        });
      }
    }
  };

  const addCertification = () => {
    appendCert({
      name: '',
      issuer: '',
      issue_date: '',
      file_url: '',
    });
  };

  const handleCertificationUpload = async (
    file: File, 
    index: number
  ) => {
    if (!onboardingId) return;

    setUploading(index);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/certifications/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('onboarding-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('onboarding-documents')
        .getPublicUrl(fileName);

      setValue(`certifications.${index}.file_url`, publicUrl);

      toast({
        title: 'File uploaded',
        description: 'Certification file uploaded successfully',
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload certification file',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = (formData: SkillsStepData) => {
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common Skills */}
          <div>
            <Label className="text-base">Quick Add Common Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_SKILLS.map(skill => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addSkill(skill)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
            />
            <Button type="button" onClick={() => addSkill(newSkill)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Skills List */}
          <div className="space-y-3">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    {...register(`skills.${index}.skill_name`)}
                    placeholder="Skill name"
                    className="mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Experience:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="60"
                      {...register(`skills.${index}.experience_years`, { valueAsNumber: true })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">years</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {errors.skills && (
            <p className="text-sm text-destructive">{errors.skills.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Certifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Certifications (Optional)</CardTitle>
            <Button type="button" variant="outline" onClick={addCertification}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {certFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Certification {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCert(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Certification Name *</Label>
                  <Input
                    {...register(`certifications.${index}.name`)}
                    placeholder="e.g., Electrical Safety Certificate"
                  />
                  {errors.certifications?.[index]?.name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.certifications[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Issuing Authority *</Label>
                  <Input
                    {...register(`certifications.${index}.issuer`)}
                    placeholder="e.g., State Electrical Board"
                  />
                  {errors.certifications?.[index]?.issuer && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.certifications[index]?.issuer?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Issue Date *</Label>
                  <Input
                    type="date"
                    {...register(`certifications.${index}.issue_date`)}
                  />
                  {errors.certifications?.[index]?.issue_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.certifications[index]?.issue_date?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Certificate File (Optional)</Label>
                  <div className="flex items-center gap-2">
                    {watchedFields.certifications?.[index]?.file_url ? (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="text-green-600">File uploaded</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCertificationUpload(file, index);
                            }
                          }}
                          disabled={uploading === index}
                          className="hidden"
                          id={`cert-file-${index}`}
                        />
                        <Label htmlFor={`cert-file-${index}`} className="cursor-pointer">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading === index}
                            asChild
                          >
                            <span>
                              {uploading === index ? (
                                'Uploading...'
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </span>
                          </Button>
                        </Label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {certFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No certifications added yet</p>
              <p className="text-sm">Add your professional certifications to strengthen your profile</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={!isValid} className="w-full">
        Save & Continue
      </Button>
    </form>
  );
}