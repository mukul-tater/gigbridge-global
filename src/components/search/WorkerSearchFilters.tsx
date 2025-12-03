import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Save, X, MapPin, DollarSign, Briefcase, Award } from 'lucide-react';
import { NATIONALITIES, AVAILABILITY_OPTIONS, POPULAR_SKILLS } from '@/lib/constants';

export interface WorkerFilters {
  keyword: string;
  nationality: string;
  currentLocation: string;
  skills: string[];
  experienceYears: number[];
  salaryMin: number;
  salaryMax: number;
  hasPassport: boolean;
  hasVisa: boolean;
  availability: string;
}

interface WorkerSearchFiltersProps {
  filters: WorkerFilters;
  onFiltersChange: (filters: WorkerFilters) => void;
  onSearch: () => void;
  onSaveSearch: () => void;
  loading?: boolean;
}

export default function WorkerSearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onSaveSearch,
  loading = false
}: WorkerSearchFiltersProps) {
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
          Search by Name or Skills
        </Label>
        <Input
          id="keyword"
          placeholder="e.g., Welder, Electrician"
          value={filters.keyword}
          onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
        />
      </div>

      {/* Nationality & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Select
            value={filters.nationality}
            onValueChange={(value) => onFiltersChange({ ...filters, nationality: value })}
          >
            <SelectTrigger id="nationality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50 max-h-64">
              {NATIONALITIES.map(nat => (
                <SelectItem key={nat} value={nat}>{nat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            <MapPin className="h-4 w-4 inline mr-2" />
            Current Location
          </Label>
          <Input
            id="location"
            placeholder="e.g., Delhi, Manila"
            value={filters.currentLocation}
            onChange={(e) => onFiltersChange({ ...filters, currentLocation: e.target.value })}
          />
        </div>
      </div>

      {/* Experience Range */}
      <div className="space-y-4">
        <Label>
          <Award className="h-4 w-4 inline mr-2" />
          Years of Experience
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{filters.experienceYears[0]} years</span>
            <span>{filters.experienceYears[1]}+ years</span>
          </div>
          <Slider
            min={0}
            max={30}
            step={1}
            value={filters.experienceYears}
            onValueChange={(value) => 
              onFiltersChange({ ...filters, experienceYears: value as [number, number] })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Expected Salary Range */}
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

      {/* Availability */}
      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Select
          value={filters.availability}
          onValueChange={(value) => onFiltersChange({ ...filters, availability: value })}
        >
          <SelectTrigger id="availability">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {AVAILABILITY_OPTIONS.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document Status */}
      <div className="space-y-3">
        <Label>Document Status</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="passport"
              checked={filters.hasPassport}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, hasPassport: checked as boolean })
              }
            />
            <Label htmlFor="passport" className="cursor-pointer">
              Has Valid Passport
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visa"
              checked={filters.hasVisa}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, hasVisa: checked as boolean })
              }
            />
            <Label htmlFor="visa" className="cursor-pointer">
              Has Work Visa
            </Label>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>
          <Briefcase className="h-4 w-4 inline mr-2" />
          Required Skills
        </Label>
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
          {loading ? 'Searching...' : 'Search Workers'}
        </Button>
        <Button
          variant="outline"
          onClick={() => onFiltersChange({
            keyword: '',
            nationality: 'All Nationalities',
            currentLocation: '',
            skills: [],
            experienceYears: [0, 30],
            salaryMin: 0,
            salaryMax: 10000,
            hasPassport: false,
            hasVisa: false,
            availability: 'All'
          })}
        >
          Clear All
        </Button>
      </div>
    </Card>
  );
}
