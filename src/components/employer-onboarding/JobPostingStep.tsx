import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase } from 'lucide-react';
import { EmployerOnboardingData } from '@/pages/EmployerOnboarding';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(5, 'Job title is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  skills: z.string().min(3, 'At least one skill is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  minSalary: z.number().min(0, 'Minimum salary is required'),
  maxSalary: z.number().min(0, 'Maximum salary is required'),
  currency: z.string().default('USD'),
  accommodation: z.boolean().default(false),
  benefits: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data: EmployerOnboardingData;
  onComplete: (data: Partial<EmployerOnboardingData>) => void;
  onNext: () => void;
}

export default function JobPostingStep({ data, onComplete, onNext }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data.jobPosting,
      skills: data.jobPosting?.skills?.join(', '),
    },
  });

  const accommodation = watch('accommodation');

  const onSubmit = (formData: FormData) => {
    onComplete({
      jobPosting: {
        title: formData.title,
        description: formData.description,
        skills: formData.skills.split(',').map((s) => s.trim()),
        country: formData.country,
        city: formData.city,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        currency: formData.currency,
        accommodation: formData.accommodation,
        benefits: formData.benefits || '',
      },
    });
    toast.success('Job posting saved as draft');
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center mb-6">
        <Briefcase className="mr-2 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Create Your First Job Posting</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input id="title" placeholder="e.g., Construction Site Manager" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Role Description *</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="Describe the job responsibilities, requirements, and what makes this opportunity great..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="skills">Required Skills *</Label>
          <Input
            id="skills"
            placeholder="e.g., Welding, Safety Management, Blueprint Reading (comma-separated)"
            {...register('skills')}
          />
          {errors.skills && <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Work Location - Country *</Label>
            <Input id="country" {...register('country')} />
            {errors.country && (
              <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="minSalary">Minimum Salary *</Label>
            <Input
              id="minSalary"
              type="number"
              {...register('minSalary', { valueAsNumber: true })}
            />
            {errors.minSalary && (
              <p className="text-sm text-destructive mt-1">{errors.minSalary.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="maxSalary">Maximum Salary *</Label>
            <Input
              id="maxSalary"
              type="number"
              {...register('maxSalary', { valueAsNumber: true })}
            />
            {errors.maxSalary && (
              <p className="text-sm text-destructive mt-1">{errors.maxSalary.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" defaultValue="USD" {...register('currency')} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="accommodation"
            checked={accommodation}
            onCheckedChange={(checked) => setValue('accommodation', checked as boolean)}
          />
          <Label htmlFor="accommodation" className="cursor-pointer">
            Accommodation Provided
          </Label>
        </div>

        <div>
          <Label htmlFor="benefits">Additional Benefits</Label>
          <Textarea
            id="benefits"
            rows={3}
            placeholder="Health insurance, food allowance, transportation, etc."
            {...register('benefits')}
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 This job will be saved as a draft. You can edit it later before publishing.
        </p>
      </div>

      <Button type="submit" className="w-full">
        Save & Continue to Compliance
      </Button>
    </form>
  );
}
