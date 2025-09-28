import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Briefcase } from 'lucide-react';

const jobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role/position is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  responsibilities: z.string().optional(),
}).refine((data) => {
  if (!data.is_current && !data.end_date) {
    return false;
  }
  return true;
}, {
  message: "End date is required for non-current positions",
  path: ["end_date"],
});

const workHistorySchema = z.object({
  jobs: z.array(jobSchema),
});

type WorkHistoryData = z.infer<typeof workHistorySchema>;

interface WorkHistoryStepProps {
  data: Partial<WorkHistoryData>;
  onComplete: (data: WorkHistoryData) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

export default function WorkHistoryStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: WorkHistoryStepProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<WorkHistoryData>({
    resolver: zodResolver(workHistorySchema),
    defaultValues: {
      jobs: data.jobs || [],
    },
    mode: 'onChange',
  });

  const { fields: jobFields, append: appendJob, remove: removeJob } = useFieldArray({
    control,
    name: 'jobs',
  });

  const watchedJobs = watch('jobs');

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const addJob = () => {
    appendJob({
      company_name: '',
      role: '',
      start_date: '',
      end_date: '',
      is_current: false,
      responsibilities: '',
    });
  };

  const handleCurrentJobToggle = (index: number, checked: boolean) => {
    setValue(`jobs.${index}.is_current`, checked);
    if (checked) {
      setValue(`jobs.${index}.end_date`, '');
    }
  };

  const onSubmit = (formData: WorkHistoryData) => {
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button type="button" variant="outline" onClick={addJob}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {jobFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Position {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJob(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    {...register(`jobs.${index}.company_name`)}
                    placeholder="e.g., ABC Construction Ltd."
                  />
                  {errors.jobs?.[index]?.company_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.jobs[index]?.company_name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Role/Position *</Label>
                  <Input
                    {...register(`jobs.${index}.role`)}
                    placeholder="e.g., Senior Electrician"
                  />
                  {errors.jobs?.[index]?.role && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.jobs[index]?.role?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    {...register(`jobs.${index}.start_date`)}
                  />
                  {errors.jobs?.[index]?.start_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.jobs[index]?.start_date?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    {...register(`jobs.${index}.end_date`)}
                    disabled={watchedJobs[index]?.is_current}
                    placeholder={watchedJobs[index]?.is_current ? 'Current position' : ''}
                  />
                  {errors.jobs?.[index]?.end_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.jobs[index]?.end_date?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${index}`}
                  checked={watchedJobs[index]?.is_current || false}
                  onCheckedChange={(checked) => 
                    handleCurrentJobToggle(index, checked as boolean)
                  }
                />
                <Label htmlFor={`current-${index}`} className="text-sm">
                  I currently work here
                </Label>
              </div>

              <div>
                <Label>Key Responsibilities (Optional)</Label>
                <Textarea
                  {...register(`jobs.${index}.responsibilities`)}
                  placeholder="Describe your main duties and achievements..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          {jobFields.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No work experience added</h3>
              <p className="text-sm mb-4">
                Add your previous work experience to showcase your background
              </p>
              <Button type="button" variant="outline" onClick={addJob}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Tips for Work History
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Include all relevant work experience, even if it was informal</li>
          <li>• Focus on construction, maintenance, or technical roles</li>
          <li>• Mention specific skills you developed or used in each role</li>
          <li>• Be honest about employment gaps - you can explain them later</li>
        </ul>
      </div>

      <Button type="submit" disabled={!isValid} className="w-full">
        Save & Continue
      </Button>
    </form>
  );
}