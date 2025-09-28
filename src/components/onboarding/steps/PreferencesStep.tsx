import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, MapPin, DollarSign, Calendar, Clock } from 'lucide-react';

const preferencesSchema = z.object({
  preferred_countries: z.array(z.string()).min(1, 'Select at least one preferred country'),
  expected_wage_currency: z.string().min(1, 'Currency is required'),
  expected_wage_amount: z.number().min(1, 'Wage amount must be greater than 0'),
  contract_length: z.string().min(1, 'Contract length preference is required'),
  availability_date: z.string().min(1, 'Availability date is required').refine((date) => {
    return new Date(date) >= new Date();
  }, 'Availability date must be today or in the future'),
});

type PreferencesData = z.infer<typeof preferencesSchema>;

interface PreferencesStepProps {
  data: Partial<PreferencesData>;
  onComplete: (data: PreferencesData) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Singapore', 'Malaysia', 'Australia', 'Canada', 'United States', 'United Kingdom',
  'Germany', 'France', 'Netherlands', 'Switzerland', 'Norway', 'Sweden'
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const CONTRACT_LENGTHS = [
  '3 months', '6 months', '12 months', '18 months', '24 months', 'Flexible'
];

export default function PreferencesStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: PreferencesStepProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    data.preferred_countries || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_countries: data.preferred_countries || [],
      expected_wage_currency: data.expected_wage_currency || 'USD',
      expected_wage_amount: data.expected_wage_amount || 0,
      contract_length: data.contract_length || '',
      availability_date: data.availability_date || '',
    },
    mode: 'onChange',
  });

  const watchedFields = watch();

  useEffect(() => {
    onValidationChange(isValid);
    setValue('preferred_countries', selectedCountries);
  }, [isValid, onValidationChange, selectedCountries, setValue]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        return prev.filter(c => c !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  const onSubmit = (formData: PreferencesData) => {
    onComplete({ ...formData, preferred_countries: selectedCountries });
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === watchedFields.expected_wage_currency);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Preferred Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Preferred Work Countries
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select countries where you would like to work
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Countries */}
          {selectedCountries.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Selected Countries</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCountries.map(country => (
                  <Badge key={country} variant="secondary" className="pr-1">
                    {country}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 hover:bg-transparent"
                      onClick={() => removeCountry(country)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Countries */}
          <div>
            <Label className="text-sm font-medium">Available Countries</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {COUNTRIES.filter(country => !selectedCountries.includes(country)).map(country => (
                <Button
                  key={country}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => toggleCountry(country)}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  {country}
                </Button>
              ))}
            </div>
          </div>

          {errors.preferred_countries && (
            <p className="text-sm text-destructive">{errors.preferred_countries.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Expected Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Expected Monthly Wage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Currency *</Label>
              <Select
                value={watchedFields.expected_wage_currency}
                onValueChange={(value) => setValue('expected_wage_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expected_wage_currency && (
                <p className="text-sm text-destructive mt-1">
                  {errors.expected_wage_currency.message}
                </p>
              )}
            </div>

            <div>
              <Label>Monthly Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {selectedCurrency?.symbol || '$'}
                </span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  className="pl-8"
                  {...register('expected_wage_amount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              {errors.expected_wage_amount && (
                <p className="text-sm text-destructive mt-1">
                  {errors.expected_wage_amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-950 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is your expected monthly wage. Final compensation will be negotiated based on the specific job, location, and your experience.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Contract Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Contract Length *</Label>
            <Select
              value={watchedFields.contract_length}
              onValueChange={(value) => setValue('contract_length', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contract length" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_LENGTHS.map(length => (
                  <SelectItem key={length} value={length}>
                    {length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contract_length && (
              <p className="text-sm text-destructive mt-1">
                {errors.contract_length.message}
              </p>
            )}
          </div>

          <div>
            <Label>Available From *</Label>
            <Input
              type="date"
              {...register('availability_date')}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.availability_date && (
              <p className="text-sm text-destructive mt-1">
                {errors.availability_date.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              When can you start working? This helps employers plan accordingly.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-950 dark:border-green-800">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Tips for Better Job Matches
        </h4>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>• Research average wages in your preferred countries for your skill level</li>
          <li>• Consider total compensation including accommodation, food, and benefits</li>
          <li>• Be flexible with contract length to access more opportunities</li>
          <li>• Account for visa processing time when setting availability date</li>
        </ul>
      </div>

      <Button type="submit" disabled={!isValid} className="w-full">
        Save & Continue
      </Button>
    </form>
  );
}