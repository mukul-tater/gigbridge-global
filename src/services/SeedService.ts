import { supabase } from '@/integrations/supabase/client';

export interface DemoAccount {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'employer' | 'worker';
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@globalgigs.demo',
    password: 'Admin@2024!',
    full_name: 'System Administrator',
    phone: '+1234567890',
    role: 'admin'
  },
  {
    email: 'employer@globalgigs.demo',
    password: 'Employer@2024!',
    full_name: 'James Wilson',
    phone: '+1234567891',
    role: 'employer'
  },
  {
    email: 'worker@globalgigs.demo',
    password: 'Worker@2024!',
    full_name: 'Maria Garcia',
    phone: '+1234567892',
    role: 'worker'
  },
  {
    email: 'worker2@globalgigs.demo',
    password: 'Worker@2024!',
    full_name: 'Ahmed Hassan',
    phone: '+1234567893',
    role: 'worker'
  },
  {
    email: 'worker3@globalgigs.demo',
    password: 'Worker@2024!',
    full_name: 'Li Wei',
    phone: '+1234567894',
    role: 'worker'
  },
  {
    email: 'employer2@globalgigs.demo',
    password: 'Employer@2024!',
    full_name: 'Sarah Johnson',
    phone: '+1234567895',
    role: 'employer'
  }
];

interface SeedResult {
  success: boolean;
  message: string;
  errors?: string[];
}

class SeedService {
  private async checkIfSeeded(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', 'admin@globalgigs.demo')
        .maybeSingle();
      
      return !!data && !error;
    } catch {
      return false;
    }
  }

  async seedDemoAccounts(): Promise<SeedResult> {
    const errors: string[] = [];
    
    // Check if already seeded
    const alreadySeeded = await this.checkIfSeeded();
    if (alreadySeeded) {
      return {
        success: false,
        message: 'Demo accounts already exist. Please clear data first.',
      };
    }

    console.log('Starting demo account creation...');

    for (const account of DEMO_ACCOUNTS) {
      try {
        const { error } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: account.full_name,
              phone: account.phone,
              role: account.role,
            }
          }
        });

        if (error) {
          errors.push(`${account.email}: ${error.message}`);
        } else {
          console.log(`✓ Created account: ${account.email}`);
        }
      } catch (error) {
        errors.push(`${account.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Some accounts failed to create`,
        errors
      };
    }

    return {
      success: true,
      message: 'All demo accounts created successfully!'
    };
  }

  async seedJobsData(employerId: string): Promise<SeedResult> {
    try {
      const jobs = [
        {
          title: 'Senior Welder - Automotive Plant',
          description: 'Seeking experienced welder for high-volume automotive manufacturing facility. Must have expertise in MIG and TIG welding.',
          requirements: '5+ years welding experience\nAWS D1.1 certification required\nAutomotive industry experience preferred',
          responsibilities: 'Perform MIG and TIG welding on automotive components\nInspect welds for quality\nMaintain welding equipment\nFollow safety protocols',
          benefits: 'Health insurance\nPaid vacation\nRetirement plan\nRelocation assistance',
          location: 'Detroit, Michigan',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'SENIOR',
          salary_min: 55000,
          salary_max: 75000,
          currency: 'USD',
          openings: 3,
          status: 'ACTIVE',
          visa_sponsorship: true,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Electrician - Commercial Construction',
          description: 'Join our growing team of commercial electricians. Work on large-scale construction projects across the country.',
          requirements: 'Licensed electrician\n3+ years commercial experience\nValid driver license\nWilling to travel',
          responsibilities: 'Install electrical systems in commercial buildings\nRead and interpret blueprints\nTroubleshoot electrical issues\nEnsure code compliance',
          benefits: 'Competitive salary\nPer diem for travel\nHealth benefits\nTool allowance',
          location: 'Multiple locations',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'MID',
          salary_min: 45000,
          salary_max: 65000,
          currency: 'USD',
          openings: 5,
          status: 'ACTIVE',
          visa_sponsorship: false,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Carpenter - Luxury Home Builder',
          description: 'High-end custom home builder seeking skilled carpenters for luxury residential projects.',
          requirements: '4+ years carpentry experience\nExpertise in finish carpentry\nOwn tools required\nReliable transportation',
          responsibilities: 'Frame walls and structures\nInstall trim and molding\nBuild custom cabinets\nFinish work on luxury homes',
          benefits: 'Top industry wages\nWeekly pay\nHealth insurance after 90 days\nPaid time off',
          location: 'Aspen, Colorado',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'MID',
          salary_min: 50000,
          salary_max: 70000,
          currency: 'USD',
          openings: 2,
          status: 'ACTIVE',
          visa_sponsorship: false,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Plumber - Industrial Facility',
          description: 'Industrial plumbing contractor needs experienced plumbers for large manufacturing facility projects.',
          requirements: 'Journeyman plumber license\n5+ years industrial experience\nPipe fitting expertise\nBlueprint reading skills',
          responsibilities: 'Install industrial piping systems\nRepair and maintain plumbing\nWork with specialized equipment\nFollow safety regulations',
          benefits: 'Union wages\nFull benefits package\nPension plan\nTraining opportunities',
          location: 'Houston, Texas',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'SENIOR',
          salary_min: 60000,
          salary_max: 85000,
          currency: 'USD',
          openings: 4,
          status: 'ACTIVE',
          visa_sponsorship: true,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'Painter - Residential & Commercial',
          description: 'Growing painting company seeking skilled painters for both residential and commercial projects.',
          requirements: '2+ years painting experience\nKnowledge of various painting techniques\nAttention to detail\nReliable and punctual',
          responsibilities: 'Prepare surfaces for painting\nApply paint, stain, and coatings\nUse spray equipment\nEnsure quality finish',
          benefits: 'Steady work year-round\nPaid training\nHealth insurance option\nPerformance bonuses',
          location: 'Phoenix, Arizona',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'ENTRY',
          salary_min: 35000,
          salary_max: 50000,
          currency: 'USD',
          openings: 6,
          status: 'ACTIVE',
          visa_sponsorship: false,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: 'HVAC Technician - Service & Installation',
          description: 'Established HVAC company needs certified technicians for installation and service work.',
          requirements: 'EPA certification required\n3+ years HVAC experience\nValid driver license\nCustomer service skills',
          responsibilities: 'Install HVAC systems\nPerform maintenance and repairs\nDiagnose system problems\nProvide customer quotes',
          benefits: 'Company vehicle provided\nHealth insurance\nRetirement matching\nContinuing education',
          location: 'Atlanta, Georgia',
          country: 'United States',
          job_type: 'FULL_TIME',
          experience_level: 'MID',
          salary_min: 48000,
          salary_max: 68000,
          currency: 'USD',
          openings: 3,
          status: 'ACTIVE',
          visa_sponsorship: false,
          remote_allowed: false,
          employer_id: employerId,
          posted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .insert(jobs)
        .select();

      if (jobsError) throw jobsError;

      // Add skills to jobs
      if (jobsData) {
        const jobSkills = [
          { job_id: jobsData[0]?.id, skill_name: 'MIG Welding' },
          { job_id: jobsData[0]?.id, skill_name: 'TIG Welding' },
          { job_id: jobsData[0]?.id, skill_name: 'Blueprint Reading' },
          { job_id: jobsData[1]?.id, skill_name: 'Electrical Installation' },
          { job_id: jobsData[1]?.id, skill_name: 'Code Compliance' },
          { job_id: jobsData[2]?.id, skill_name: 'Finish Carpentry' },
          { job_id: jobsData[2]?.id, skill_name: 'Custom Cabinetry' },
          { job_id: jobsData[3]?.id, skill_name: 'Industrial Plumbing' },
          { job_id: jobsData[3]?.id, skill_name: 'Pipe Fitting' },
          { job_id: jobsData[4]?.id, skill_name: 'Spray Painting' },
          { job_id: jobsData[4]?.id, skill_name: 'Surface Preparation' },
          { job_id: jobsData[5]?.id, skill_name: 'HVAC Installation' },
          { job_id: jobsData[5]?.id, skill_name: 'System Diagnostics' },
        ];

        await supabase.from('job_skills').insert(jobSkills.filter(js => js.job_id));
      }

      return {
        success: true,
        message: `Created ${jobs.length} demo jobs with skills`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seed jobs'
      };
    }
  }

  async seedWorkerData(workerId: string): Promise<SeedResult> {
    try {
      // Create worker profile
      await supabase.from('worker_profiles').insert({
        user_id: workerId,
        bio: 'Experienced skilled worker with multiple certifications and years of hands-on experience in the field.',
        nationality: 'United States',
        current_location: 'Los Angeles, CA',
        has_passport: true,
        has_visa: false,
        years_of_experience: 5,
        expected_salary_min: 45000,
        expected_salary_max: 65000,
        currency: 'USD',
        availability: 'IMMEDIATE',
        languages: ['English', 'Spanish'],
        visa_countries: []
      });

      // Add skills
      const skills = [
        { worker_id: workerId, skill_name: 'Welding', years_of_experience: 5, proficiency_level: 'Expert' },
        { worker_id: workerId, skill_name: 'Metal Fabrication', years_of_experience: 4, proficiency_level: 'Advanced' },
        { worker_id: workerId, skill_name: 'Blueprint Reading', years_of_experience: 5, proficiency_level: 'Expert' },
      ];

      await supabase.from('worker_skills').insert(skills);

      // Add certifications
      const certs = [
        {
          worker_id: workerId,
          certification_name: 'AWS Certified Welder',
          issuing_organization: 'American Welding Society',
          issue_date: '2020-06-15',
          expiry_date: '2025-06-15',
          verified: true
        }
      ];

      await supabase.from('worker_certifications').insert(certs);

      // Add work experience
      const experience = [
        {
          worker_id: workerId,
          job_title: 'Senior Welder',
          company_name: 'ABC Manufacturing',
          location: 'Detroit, MI',
          start_date: '2019-01-01',
          end_date: '2023-12-31',
          is_current: false,
          description: 'Performed MIG and TIG welding on automotive components. Led team of 5 junior welders.'
        },
        {
          worker_id: workerId,
          job_title: 'Lead Fabricator',
          company_name: 'XYZ Industries',
          location: 'Chicago, IL',
          start_date: '2024-01-15',
          end_date: null,
          is_current: true,
          description: 'Currently leading fabrication projects for industrial clients.'
        }
      ];

      await supabase.from('work_experience').insert(experience);

      return {
        success: true,
        message: 'Worker profile created with skills, certifications, and experience'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seed worker data'
      };
    }
  }

  async getEmployerUserId(): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'employer@globalgigs.demo')
        .maybeSingle();
      
      return data?.id || null;
    } catch {
      return null;
    }
  }

  async getWorkerUserId(): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'worker@globalgigs.demo')
        .maybeSingle();
      
      return data?.id || null;
    } catch {
      return null;
    }
  }

  async seedAllData(): Promise<SeedResult> {
    const results: string[] = [];
    const errors: string[] = [];

    // Step 1: Create demo accounts
    const accountsResult = await this.seedDemoAccounts();
    if (!accountsResult.success) {
      return accountsResult;
    }
    results.push(accountsResult.message);

    // Wait for accounts to be created
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Get employer ID and seed jobs
    const employerId = await this.getEmployerUserId();
    if (employerId) {
      const jobsResult = await this.seedJobsData(employerId);
      if (jobsResult.success) {
        results.push(jobsResult.message);
      } else {
        errors.push(jobsResult.message);
      }
    } else {
      errors.push('Could not find employer account to seed jobs');
    }

    // Step 3: Get worker ID and seed worker data
    const workerId = await this.getWorkerUserId();
    if (workerId) {
      const workerResult = await this.seedWorkerData(workerId);
      if (workerResult.success) {
        results.push(workerResult.message);
      } else {
        errors.push(workerResult.message);
      }
    } else {
      errors.push('Could not find worker account to seed worker data');
    }

    return {
      success: errors.length === 0,
      message: results.join('\n'),
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export const seedService = new SeedService();
