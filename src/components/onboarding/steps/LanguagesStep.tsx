import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Languages } from 'lucide-react';

const languageSchema = z.object({
  language_name: z.string().min(1, 'Language name is required'),
  proficiency: z.enum(['basic', 'conversational', 'fluent', 'native'], {
    required_error: 'Proficiency level is required',
  }),
});

const languagesStepSchema = z.object({
  languages: z.array(languageSchema).min(1, 'At least one language is required'),
});

type LanguagesStepData = z.infer<typeof languagesStepSchema>;

interface LanguagesStepProps {
  data: Partial<LanguagesStepData>;
  onComplete: (data: LanguagesStepData) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

const COMMON_LANGUAGES = [
  'English', 'Hindi', 'Arabic', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 
  'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Spanish',
  'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Russian'
];

const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Can understand and use familiar everyday expressions' },
  { value: 'conversational', label: 'Conversational', description: 'Can handle routine tasks and simple exchanges' },
  { value: 'fluent', label: 'Fluent', description: 'Can express ideas fluently and use language effectively' },
  { value: 'native', label: 'Native', description: 'Native or bilingual proficiency' },
];

export default function LanguagesStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: LanguagesStepProps) {
  const [newLanguage, setNewLanguage] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<LanguagesStepData>({
    resolver: zodResolver(languagesStepSchema),
    defaultValues: {
      languages: data.languages?.length ? data.languages : [
        { language_name: 'English', proficiency: 'conversational' }
      ],
    },
    mode: 'onChange',
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'languages',
  });

  const watchedLanguages = watch('languages');

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  const addLanguage = (languageName: string) => {
    if (languageName.trim()) {
      const exists = languageFields.some(field => 
        field.language_name.toLowerCase() === languageName.toLowerCase()
      );
      
      if (!exists) {
        appendLanguage({ 
          language_name: languageName.trim(), 
          proficiency: 'basic' 
        });
        setNewLanguage('');
      }
    }
  };

  const onSubmit = (formData: LanguagesStepData) => {
    onComplete(formData);
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'conversational': return 'bg-blue-100 text-blue-800';
      case 'fluent': return 'bg-green-100 text-green-800';
      case 'native': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language Skills</CardTitle>
          <p className="text-sm text-muted-foreground">
            Language skills are important for international job opportunities
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Add Common Languages */}
          <div>
            <Label className="text-base">Quick Add Languages</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_LANGUAGES.map(language => {
                const alreadyAdded = languageFields.some(field => 
                  field.language_name.toLowerCase() === language.toLowerCase()
                );
                
                return (
                  <Badge
                    key={language}
                    variant={alreadyAdded ? "secondary" : "outline"}
                    className={`cursor-pointer ${
                      alreadyAdded 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    onClick={() => !alreadyAdded && addLanguage(language)}
                  >
                    {alreadyAdded ? (
                      language
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        {language}
                      </>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Custom Language Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add other language..."
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage(newLanguage))}
            />
            <Button type="button" onClick={() => addLanguage(newLanguage)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Languages List */}
          <div className="space-y-4">
            {languageFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Language *</Label>
                    <Input
                      {...register(`languages.${index}.language_name`)}
                      placeholder="Language name"
                    />
                    {errors.languages?.[index]?.language_name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.languages[index]?.language_name?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Proficiency Level *</Label>
                    <Select
                      value={watchedLanguages[index]?.proficiency || ''}
                      onValueChange={(value) => 
                        setValue(`languages.${index}.proficiency`, value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {level.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.languages?.[index]?.proficiency && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.languages[index]?.proficiency?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge 
                      className={getProficiencyColor(watchedLanguages[index]?.proficiency || '')}
                    >
                      {PROFICIENCY_LEVELS.find(l => l.value === watchedLanguages[index]?.proficiency)?.label}
                    </Badge>
                    
                    {languageFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLanguage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.languages && (
            <p className="text-sm text-destructive">{errors.languages.message}</p>
          )}

          {languageFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No languages added yet</p>
              <p className="text-sm">Add at least one language to continue</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-950 dark:border-green-800">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Proficiency Level Guide
        </h4>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li><strong>Basic:</strong> Can understand and use basic phrases</li>
          <li><strong>Conversational:</strong> Can have simple conversations about familiar topics</li>
          <li><strong>Fluent:</strong> Can express ideas clearly and understand complex texts</li>
          <li><strong>Native:</strong> Native speaker or equivalent proficiency</li>
        </ul>
      </div>

      <Button type="submit" disabled={!isValid} className="w-full">
        Save & Continue
      </Button>
    </form>
  );
}