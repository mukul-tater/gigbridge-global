import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Save, X, MapPin, DollarSign, Briefcase, Globe } from 'lucide-react';

export interface JobFilters {
  keyword: string;
  location: string;
  country: string;
  jobCategory: string;
  salaryMin: number;
  salaryMax: number;
  visaSponsorship: boolean;
  skills: string[];
  experienceLevel: string;
}

interface JobSearchFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onSearch: () => void;
  onSaveSearch: () => void;
  loading?: boolean;
}

const COUNTRIES = [
  'All Countries', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'Japan', 'Singapore', 'South Korea', 'Germany', 'UK', 'Canada', 'Australia'
];

const JOB_CATEGORIES = [
  'All Categories', 'Construction', 'Electrical', 'Welding', 'Plumbing',
  'Manufacturing', 'Delivery', 'Hospitality', 'Healthcare', 'IT', 'Engineering'
];

const EXPERIENCE_LEVELS = [
  'All Levels', 'Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years'
];

const POPULAR_SKILLS = [
  'Welding', 'Electrical', 'Plumbing', 'Construction', 'Manufacturing',
  'Carpentry', 'Painting', 'Heavy Equipment', 'Safety Management', 'Quality Control'
];

export default function JobSearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onSaveSearch,
  loading = false
}: JobSearchFiltersProps) {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      onFiltersChange({
        ...filters,
        skills: [...filters.skills, skill]
      });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills.filter(s => s !== skill)
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advanced Filters</h2>
        <Button variant="ghost" size="sm" onClick={onSaveSearch}>
          <Save className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <Label htmlFor="keyword">
          <Search className="h-4 w-4 inline mr-2" />
          Job Title or Keywords
        </Label>
        <Input
          id="keyword"
          placeholder="e.g., Welding Engineer, Construction Supervisor"
          value={filters.keyword}
          onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
        />
      </div>

      {/* Location & Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">
            <Globe className="h-4 w-4 inline mr-2" />
            Country
          </Label>
          <Select
            value={filters.country}
            onValueChange={(value) => onFiltersChange({ ...filters, country: value })}
          >
            <SelectTrigger id="country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            <MapPin className="h-4 w-4 inline mr-2" />
            City/Region
          </Label>
          <Input
            id="location"
            placeholder="e.g., Dubai, Riyadh"
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      {/* Job Category & Experience */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            <Briefcase className="h-4 w-4 inline mr-2" />
            Job Category
          </Label>
          <Select
            value={filters.jobCategory}
            onValueChange={(value) => onFiltersChange({ ...filters, jobCategory: value })}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {JOB_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <Select
            value={filters.experienceLevel}
            onValueChange={(value) => onFiltersChange({ ...filters, experienceLevel: value })}
          >
            <SelectTrigger id="experience">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {EXPERIENCE_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-4">
        <Label>
          <DollarSign className="h-4 w-4 inline mr-2" />
          Expected Salary Range (USD/month)
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>${filters.salaryMin.toLocaleString()}</span>
            <span>${filters.salaryMax.toLocaleString()}</span>
          </div>
          <Slider
            min={0}
            max={10000}
            step={500}
            value={[filters.salaryMin, filters.salaryMax]}
            onValueChange={([min, max]) => 
              onFiltersChange({ ...filters, salaryMin: min, salaryMax: max })
            }
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={filters.salaryMin}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                salaryMin: parseInt(e.target.value) || 0 
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.salaryMax}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                salaryMax: parseInt(e.target.value) || 10000 
              })}
            />
          </div>
        </div>
      </div>

      {/* Visa Sponsorship */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="visa"
          checked={filters.visaSponsorship}
          onCheckedChange={(checked) => 
            onFiltersChange({ ...filters, visaSponsorship: checked as boolean })
          }
        />
        <Label htmlFor="visa" className="cursor-pointer">
          Visa Sponsorship Available
        </Label>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Required Skills</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add skill (e.g., Welding)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddSkill(skillInput)}
            >
              Add
            </Button>
          </div>
          
          {/* Selected Skills */}
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Popular Skills Quick Add */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Popular Skills:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.filter(s => !filters.skills.includes(s)).map(skill => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleAddSkill(skill)}
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSearch}
          disabled={loading}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Searching...' : 'Search Jobs'}
        </Button>
        <Button
          variant="outline"
          onClick={() => onFiltersChange({
            keyword: '',
            location: '',
            country: 'All Countries',
            jobCategory: 'All Categories',
            salaryMin: 0,
            salaryMax: 10000,
            visaSponsorship: false,
            skills: [],
            experienceLevel: 'All Levels'
          })}
        >
          Clear All
        </Button>
      </div>
    </Card>
  );
}
