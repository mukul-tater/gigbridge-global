import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobPostingSchema, type JobPostingFormData } from "@/lib/validations/job";
import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function PostJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      currency: "INR",
      openings: 1,
      visa_sponsorship: false,
      remote_allowed: false,
      status: "DRAFT",
      skills: [],
    },
  });

  const jobType = watch("job_type");
  const experienceLevel = watch("experience_level");
  const currency = watch("currency");
  const status = watch("status");

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      setValue("skills", updatedSkills);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);
    setValue("skills", updatedSkills);
  };

  const onSubmit = async (data: JobPostingFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the job
      const jobData = {
        employer_id: user.id,
        title: data.title,
        description: data.description,
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        responsibilities: data.responsibilities || null,
        location: data.location,
        country: data.country,
        job_type: data.job_type,
        experience_level: data.experience_level,
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        currency: data.currency,
        openings: data.openings,
        visa_sponsorship: data.visa_sponsorship,
        remote_allowed: data.remote_allowed,
        status: data.status,
        expires_at: data.expires_at,
        posted_at: data.status === "ACTIVE" ? new Date().toISOString() : null,
      };

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (jobError) throw jobError;

      // Add skills if any
      if (skills.length > 0 && job) {
        const skillsData = skills.map(skill => ({
          job_id: job.id,
          skill_name: skill,
        }));

        const { error: skillsError } = await supabase
          .from("job_skills")
          .insert(skillsData);

        if (skillsError) throw skillsError;
      }

      toast({
        title: "Success",
        description: data.status === "ACTIVE" 
          ? "Job posted successfully" 
          : "Job saved as draft",
      });

      navigate("/employer/manage-jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmployerHeader />
      <div className="flex flex-1">
        <EmployerSidebar />
        <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g. Senior Welder - Industrial Fabrication"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the role in detail..."
                    rows={6}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    {...register("responsibilities")}
                    placeholder="List main responsibilities..."
                    rows={4}
                  />
                  {errors.responsibilities && (
                    <p className="text-sm text-destructive mt-1">{errors.responsibilities.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    {...register("requirements")}
                    placeholder="List qualifications, experience, certifications..."
                    rows={4}
                  />
                  {errors.requirements && (
                    <p className="text-sm text-destructive mt-1">{errors.requirements.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    {...register("benefits")}
                    placeholder="List benefits and perks..."
                    rows={4}
                  />
                  {errors.benefits && (
                    <p className="text-sm text-destructive mt-1">{errors.benefits.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="e.g. Mumbai, Maharashtra"
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="e.g. India"
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select
                      value={jobType}
                      onValueChange={(value) => setValue("job_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="TEMPORARY">Temporary</SelectItem>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.job_type && (
                      <p className="text-sm text-destructive mt-1">{errors.job_type.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="experience_level">Experience Level *</Label>
                    <Select
                      value={experienceLevel}
                      onValueChange={(value) => setValue("experience_level", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRY">Entry Level</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="SENIOR">Senior</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.experience_level && (
                      <p className="text-sm text-destructive mt-1">{errors.experience_level.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={currency}
                      onValueChange={(value) => setValue("currency", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                        <SelectItem value="SAR">SAR (﷼)</SelectItem>
                        <SelectItem value="QAR">QAR (ر.ق)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary_min">Min Salary</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      {...register("salary_min", { valueAsNumber: true })}
                      placeholder="e.g. 25000"
                    />
                    {errors.salary_min && (
                      <p className="text-sm text-destructive mt-1">{errors.salary_min.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="salary_max">Max Salary</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      {...register("salary_max", { valueAsNumber: true })}
                      placeholder="e.g. 35000"
                    />
                    {errors.salary_max && (
                      <p className="text-sm text-destructive mt-1">{errors.salary_max.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openings">Number of Openings *</Label>
                    <Input
                      id="openings"
                      type="number"
                      {...register("openings", { valueAsNumber: true })}
                      placeholder="e.g. 5"
                    />
                    {errors.openings && (
                      <p className="text-sm text-destructive mt-1">{errors.openings.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expiry Date *</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      {...register("expires_at")}
                    />
                    {errors.expires_at && (
                      <p className="text-sm text-destructive mt-1">{errors.expires_at.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visa_sponsorship"
                      onCheckedChange={(checked) => setValue("visa_sponsorship", checked as boolean)}
                    />
                    <Label htmlFor="visa_sponsorship" className="cursor-pointer">
                      Visa Sponsorship Available
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote_allowed"
                      onCheckedChange={(checked) => setValue("remote_allowed", checked as boolean)}
                    />
                    <Label htmlFor="remote_allowed" className="cursor-pointer">
                      Remote Work Allowed
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., Welding, TIG, MIG)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue("status", "DRAFT");
                  handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setValue("status", "ACTIVE");
                  handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </div>
        </form>
      </main>
      </div>
    </div>
  );
}
