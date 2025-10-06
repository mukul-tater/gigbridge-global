import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';
import { EmployerOnboardingData } from '@/pages/EmployerOnboarding';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data: EmployerOnboardingData;
  onComplete: (data: Partial<EmployerOnboardingData>) => void;
  onNext: () => void;
}

const INDUSTRIES = [
  'Construction',
  'Manufacturing',
  'Hospitality',
  'Healthcare',
  'Technology',
  'Agriculture',
  'Logistics',
  'Retail',
  'Other',
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'UAE',
  'Singapore',
  'India',
  'Other',
];

export default function CompanyProfileStep({ data, onComplete, onNext }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(data.companyProfile?.logoUrl);
  const [certificateUrl, setCertificateUrl] = useState<string | undefined>(
    data.companyProfile?.certificateUrl
  );
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'failed' | undefined>(
    data.companyProfile?.verificationStatus
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data.companyProfile,
  });

  const industry = watch('industry');
  const country = watch('country');

  useEffect(() => {
    if (industry) setValue('industry', industry);
  }, [industry, setValue]);

  useEffect(() => {
    if (country) setValue('country', country);
  }, [country, setValue]);

  const handleVerifyIndustry = async () => {
    setIsVerifying(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const statuses: Array<'verified' | 'pending' | 'failed'> = ['verified', 'pending', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setVerificationStatus(randomStatus);
      
      if (randomStatus === 'verified') {
        toast.success('Industry verification successful!');
      } else if (randomStatus === 'pending') {
        toast.info('Verification pending', {
          description: 'Your documents are being reviewed.',
        });
      } else {
        toast.error('Verification failed', {
          description: 'Please check your documents and try again.',
        });
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (formData: FormData) => {
    onComplete({
      companyProfile: {
        companyName: formData.companyName,
        industry: formData.industry,
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        logoUrl,
        certificateUrl,
        verificationStatus,
      },
    });
    onNext();
  };

  const getStatusBadge = () => {
    if (!verificationStatus) return null;

    const config = {
      verified: { icon: CheckCircle, label: 'Verified', variant: 'default' as const },
      pending: { icon: Clock, label: 'Pending', variant: 'secondary' as const },
      failed: { icon: XCircle, label: 'Failed', variant: 'destructive' as const },
    };

    const { icon: Icon, label, variant } = config[verificationStatus];

    return (
      <Badge variant={variant} className="ml-2">
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center mb-6">
        <Building2 className="mr-2 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Company Profile & Verification</h2>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" {...register('companyName')} />
          {errors.companyName && (
            <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="industry">Industry Type *</Label>
          <Select onValueChange={(value) => setValue('industry', value)} defaultValue={industry}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="registrationNumber">Company Registration Number *</Label>
          <Input id="registrationNumber" {...register('registrationNumber')} />
          {errors.registrationNumber && (
            <p className="text-sm text-destructive mt-1">{errors.registrationNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Official Email *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" type="tel" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country *</Label>
          <Select onValueChange={(value) => setValue('country', value)} defaultValue={country}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register('city')} />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input id="address" {...register('address')} />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Company Logo</Label>
          <FileUpload
            onUploadComplete={(files) => setLogoUrl(files[0]?.url)}
            accept="image/*"
            maxSize={5}
          />
        </div>

        <div>
          <Label>Registration Certificate *</Label>
          <FileUpload
            onUploadComplete={(files) => setCertificateUrl(files[0]?.url)}
            accept="image/*,application/pdf"
            maxSize={10}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <Button
          type="button"
          variant="outline"
          onClick={handleVerifyIndustry}
          disabled={isVerifying || !certificateUrl}
        >
          {isVerifying ? 'Verifying...' : 'Verify Industry'}
        </Button>
        <p className="text-sm text-muted-foreground">
          Upload your certificate and click verify to proceed
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={!certificateUrl}>
        Continue to Job Posting
      </Button>
    </form>
  );
}
