import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface ProfileProgressCardProps {
  hasProfile: boolean;
  hasDocuments: boolean;
  documentsVerified: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasCertifications: boolean;
}

export default function ProfileProgressCard({
  hasProfile,
  hasDocuments,
  documentsVerified,
  hasSkills,
  hasExperience,
  hasCertifications
}: ProfileProgressCardProps) {
  const steps = [
    { label: 'Complete Basic Profile', completed: hasProfile },
    { label: 'Add Skills', completed: hasSkills },
    { label: 'Add Work Experience', completed: hasExperience },
    { label: 'Upload Documents', completed: hasDocuments },
    { label: 'Document Verification', completed: documentsVerified },
    { label: 'Add Certifications', completed: hasCertifications },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Profile Completion</h2>
          <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {progressPercentage === 100 ? (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Profile Complete! You're ready to apply for jobs.
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Complete all steps to increase your chances of getting hired
          </p>
        </div>
      )}
    </Card>
  );
}
