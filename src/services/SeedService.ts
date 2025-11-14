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
      // Job categories with templates
      const categories = [
        {
          name: 'Welding',
          titles: ['Senior Welder', 'MIG Welder', 'TIG Welder', 'Pipeline Welder', 'Structural Welder', 'Fabrication Welder'],
          skills: ['MIG Welding', 'TIG Welding', 'Arc Welding', 'Blueprint Reading']
        },
        {
          name: 'Electrical',
          titles: ['Industrial Electrician', 'Commercial Electrician', 'Maintenance Electrician', 'Solar Electrician', 'Master Electrician'],
          skills: ['Electrical Systems', 'Panel Installation', 'Troubleshooting', 'Code Compliance']
        },
        {
          name: 'Construction',
          titles: ['Site Manager', 'Mason', 'Concrete Worker', 'Formwork Carpenter', 'Construction Laborer', 'Heavy Equipment Operator'],
          skills: ['Construction Management', 'Concrete Work', 'Blueprint Reading', 'Safety Compliance']
        },
        {
          name: 'Plumbing',
          titles: ['Master Plumber', 'Industrial Plumber', 'Pipefitter', 'HVAC Plumber', 'Service Plumber'],
          skills: ['Pipe Fitting', 'HVAC Systems', 'Plumbing Codes', 'Troubleshooting']
        },
        {
          name: 'Manufacturing',
          titles: ['CNC Operator', 'Assembly Line Worker', 'Quality Inspector', 'Machine Operator', 'Production Supervisor'],
          skills: ['CNC Programming', 'Quality Control', 'Machine Operation', 'Lean Manufacturing']
        },
        {
          name: 'Delivery & Logistics',
          titles: ['Delivery Driver', 'Warehouse Manager', 'Forklift Operator', 'Logistics Coordinator', 'Fleet Manager'],
          skills: ['Route Planning', 'Warehouse Management', 'Forklift Operation', 'Inventory Management']
        }
      ];

      const locations = [
        { city: 'Dubai', country: 'United Arab Emirates' },
        { city: 'Abu Dhabi', country: 'United Arab Emirates' },
        { city: 'Riyadh', country: 'Saudi Arabia' },
        { city: 'Jeddah', country: 'Saudi Arabia' },
        { city: 'Doha', country: 'Qatar' },
        { city: 'Kuwait City', country: 'Kuwait' },
        { city: 'Muscat', country: 'Oman' },
        { city: 'Manama', country: 'Bahrain' },
        { city: 'Singapore', country: 'Singapore' },
        { city: 'Mumbai', country: 'India' },
        { city: 'Delhi', country: 'India' },
        { city: 'Bangalore', country: 'India' }
      ];

      const jobTypes = ['FULL_TIME', 'CONTRACT', 'PART_TIME'];
      const experienceLevels = ['ENTRY', 'MID', 'SENIOR', 'EXPERT'];
      
      const jobs = [];
      
      // Generate 100 jobs
      for (let i = 0; i < 100; i++) {
        const category = categories[i % categories.length];
        const title = category.titles[Math.floor(Math.random() * category.titles.length)];
        const location = locations[i % locations.length];
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const expLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
        
        const baseSalary = expLevel === 'ENTRY' ? 2000 : expLevel === 'MID' ? 3500 : expLevel === 'SENIOR' ? 5000 : 7000;
        const salaryVariation = Math.floor(Math.random() * 1000);
        
        jobs.push({
          title: `${title} - ${category.name}`,
          description: `We are seeking a skilled ${title} to join our ${category.name.toLowerCase()} team. This position offers excellent opportunities for career growth and development in a dynamic work environment.`,
          requirements: `${expLevel === 'ENTRY' ? '1-2' : expLevel === 'MID' ? '3-5' : expLevel === 'SENIOR' ? '5-8' : '8+'} years of experience in ${category.name.toLowerCase()}\nRelevant certifications preferred\nStrong communication skills\nAbility to work in a team`,
          responsibilities: `Perform ${category.name.toLowerCase()} tasks according to project specifications\nMaintain quality standards\nFollow safety protocols\nCollaborate with team members\nReport progress to supervisors`,
          benefits: `Competitive salary\nHealth insurance\nAccommodation provided\nAnnual flight tickets\nPaid vacation`,
          location: `${location.city}`,
          country: location.country,
          job_type: jobType,
          experience_level: expLevel,
          salary_min: baseSalary + salaryVariation,
          salary_max: baseSalary + salaryVariation + 1500,
          currency: 'USD',
          openings: Math.floor(Math.random() * 10) + 1,
          status: 'ACTIVE',
          visa_sponsorship: Math.random() > 0.3,
          remote_allowed: category.name === 'Manufacturing' || category.name === 'Delivery & Logistics' ? false : Math.random() > 0.8,
          employer_id: employerId,
          posted_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      console.log(`Generated ${jobs.length} jobs`);

      // Insert jobs in batches
      const batchSize = 20;
      const insertedJobs = [];
      
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        const { data, error: jobsError } = await supabase
          .from('jobs')
          .insert(batch)
          .select();

        if (jobsError) {
          console.error('Error inserting jobs batch:', jobsError);
          return {
            success: false,
            message: 'Failed to create demo jobs',
            errors: [jobsError.message]
          };
        }
        
        if (data) {
          insertedJobs.push(...data);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Created ${insertedJobs.length} jobs`);

      // Create job skills for each job
      if (insertedJobs.length > 0) {
        // Generate skills based on job category
        const jobSkills = insertedJobs.flatMap((job) => {
          const category = categories.find(cat => job.title.includes(cat.name));
          const categorySkills = category ? category.skills : ['Communication', 'Teamwork'];
          const selectedSkills = categorySkills.slice(0, 2 + Math.floor(Math.random() * 2));
          
          return selectedSkills.map(skill => ({
            job_id: job.id,
            skill_name: skill
          }));
        });

        console.log(`Inserting ${jobSkills.length} job skills`);

        // Insert skills in batches
        for (let i = 0; i < jobSkills.length; i += 100) {
          const batch = jobSkills.slice(i, i + 100);
          const { error: skillsError } = await supabase
            .from('job_skills')
            .insert(batch);

          if (skillsError) {
            console.error('Error inserting job skills batch:', skillsError);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`Created job skills`);
      }

      return {
        success: true,
        message: `Successfully created ${insertedJobs.length} demo jobs with skills`
      };
    } catch (error) {
      console.error('Error seeding jobs:', error);
      return {
        success: false,
        message: 'Failed to seed jobs',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async seedWorkerData(workerId: string): Promise<SeedResult> {
    try {
      // Create worker profile
      const { error: profileError } = await supabase
        .from('worker_profiles')
        .insert({
          user_id: workerId,
          bio: 'Experienced blue-collar worker with expertise in various industrial and construction roles.',
          years_of_experience: 8,
          current_location: 'Mumbai, India',
          nationality: 'Indian',
          expected_salary_min: 2500,
          expected_salary_max: 4000,
          currency: 'USD',
          availability: 'IMMEDIATE',
          has_passport: true,
          passport_number: 'A12345678',
          has_visa: false,
          languages: ['English', 'Hindi', 'Arabic'],
          ecr_status: 'ECNR',
          ecr_category: 'ECNR'
        });

      if (profileError) {
        return {
          success: false,
          message: 'Failed to create worker profile',
          errors: [profileError.message]
        };
      }

      // Add skills
      const skills = [
        { skill_name: 'Welding', proficiency_level: 'EXPERT', years_of_experience: 6 },
        { skill_name: 'Electrical Work', proficiency_level: 'INTERMEDIATE', years_of_experience: 3 },
        { skill_name: 'Construction', proficiency_level: 'ADVANCED', years_of_experience: 5 }
      ];

      const { error: skillsError } = await supabase
        .from('worker_skills')
        .insert(skills.map(s => ({ ...s, worker_id: workerId })));

      if (skillsError) {
        console.error('Error creating skills:', skillsError);
      }

      // Add certifications
      const certifications = [
        {
          certification_name: 'AWS D1.1 Welding Certification',
          issuing_organization: 'American Welding Society',
          issue_date: '2020-06-15',
          verified: true
        },
        {
          certification_name: 'OSHA Safety Training',
          issuing_organization: 'OSHA',
          issue_date: '2021-03-20',
          verified: true
        }
      ];

      const { error: certError } = await supabase
        .from('worker_certifications')
        .insert(certifications.map(c => ({ ...c, worker_id: workerId })));

      if (certError) {
        console.error('Error creating certifications:', certError);
      }

      // Add work experience
      const experiences = [
        {
          company_name: 'Dubai Construction LLC',
          job_title: 'Senior Welder',
          location: 'Dubai, UAE',
          start_date: '2019-01-15',
          end_date: '2022-12-31',
          is_current: false,
          description: 'Performed structural welding on high-rise construction projects.'
        },
        {
          company_name: 'Saudi Steel Industries',
          job_title: 'Fabrication Welder',
          location: 'Riyadh, Saudi Arabia',
          start_date: '2023-02-01',
          is_current: true,
          description: 'Currently working on industrial fabrication projects.'
        }
      ];

      const { error: expError } = await supabase
        .from('work_experience')
        .insert(experiences.map(e => ({ ...e, worker_id: workerId })));

      if (expError) {
        console.error('Error creating work experience:', expError);
      }

      return {
        success: true,
        message: 'Worker profile created successfully with skills, certifications, and experience'
      };
    } catch (error) {
      console.error('Error seeding worker data:', error);
      return {
        success: false,
        message: 'Failed to seed worker data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async getEmployerUserId(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'employer@globalgigs.demo')
        .maybeSingle();

      if (error || !data) {
        console.error('Error getting employer user ID:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error getting employer user ID:', error);
      return null;
    }
  }

  async getWorkerUserId(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'worker@globalgigs.demo')
        .maybeSingle();

      if (error || !data) {
        console.error('Error getting worker user ID:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error getting worker user ID:', error);
      return null;
    }
  }

  async seedAllData(): Promise<SeedResult> {
    const errors: string[] = [];

    // Step 1: Create demo accounts
    console.log('Step 1: Creating demo accounts...');
    const accountsResult = await this.seedDemoAccounts();
    if (!accountsResult.success) {
      return accountsResult;
    }

    // Wait for accounts to be fully created
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Get employer ID and seed jobs
    console.log('Step 2: Getting employer ID and seeding jobs...');
    const employerId = await this.getEmployerUserId();
    if (!employerId) {
      errors.push('Could not find employer account');
    } else {
      const jobsResult = await this.seedJobsData(employerId);
      if (!jobsResult.success) {
        errors.push(`Jobs: ${jobsResult.message}`);
      }
    }

    // Step 3: Get worker ID and seed worker data
    console.log('Step 3: Getting worker ID and seeding worker profile...');
    const workerId = await this.getWorkerUserId();
    if (!workerId) {
      errors.push('Could not find worker account');
    } else {
      const workerResult = await this.seedWorkerData(workerId);
      if (!workerResult.success) {
        errors.push(`Worker: ${workerResult.message}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Some data failed to seed',
        errors
      };
    }

    return {
      success: true,
      message: 'All demo data seeded successfully! Demo accounts, jobs, and worker profiles created.'
    };
  }
}

export const seedService = new SeedService();
