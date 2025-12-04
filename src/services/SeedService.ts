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

  async seedJobsData(employerId: string, jobCount: number = 100): Promise<SeedResult> {
    try {
      // Ensure employer profile exists before creating jobs (foreign key requirement)
      const { data: existingProfile } = await supabase
        .from('employer_profiles')
        .select('user_id')
        .eq('user_id', employerId)
        .maybeSingle();

      if (!existingProfile) {
        console.log(`Creating employer profile for ${employerId}...`);
        const { error: profileError } = await supabase
          .from('employer_profiles')
          .insert({
            user_id: employerId,
            company_name: 'Demo Company',
            industry: 'Construction',
            company_size: '100-500'
          });

        if (profileError) {
          console.error('Error creating employer profile:', profileError);
          return {
            success: false,
            message: 'Failed to create employer profile for job creation',
            errors: [profileError.message]
          };
        }
        console.log('Employer profile created successfully');
      }

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

      // Priority countries that MUST have jobs
      const priorityLocations = [
        { city: 'Muscat', country: 'Oman' },
        { city: 'Salalah', country: 'Oman' },
        { city: 'Sohar', country: 'Oman' },
        { city: 'Tokyo', country: 'Japan' },
        { city: 'Osaka', country: 'Japan' },
        { city: 'Nagoya', country: 'Japan' },
        { city: 'Moscow', country: 'Russia' },
        { city: 'Saint Petersburg', country: 'Russia' },
        { city: 'Kazan', country: 'Russia' },
      ];

      const otherLocations = [
        // Middle East
        { city: 'Dubai', country: 'United Arab Emirates' },
        { city: 'Abu Dhabi', country: 'United Arab Emirates' },
        { city: 'Riyadh', country: 'Saudi Arabia' },
        { city: 'Jeddah', country: 'Saudi Arabia' },
        { city: 'Doha', country: 'Qatar' },
        { city: 'Kuwait City', country: 'Kuwait' },
        { city: 'Manama', country: 'Bahrain' },
        // East Asia
        { city: 'Seoul', country: 'South Korea' },
        { city: 'Singapore', country: 'Singapore' },
        // Western Europe
        { city: 'Berlin', country: 'Germany' },
        { city: 'Munich', country: 'Germany' },
        { city: 'Amsterdam', country: 'Netherlands' },
        // Scandinavia
        { city: 'Oslo', country: 'Norway' },
        { city: 'Stockholm', country: 'Sweden' },
        // Others
        { city: 'Sydney', country: 'Australia' },
        { city: 'Toronto', country: 'Canada' },
        { city: 'London', country: 'United Kingdom' }
      ];

      const jobTypes = ['FULL_TIME', 'CONTRACT', 'PART_TIME'];
      const experienceLevels = ['ENTRY', 'MID', 'SENIOR', 'EXPERT'];
      
      const jobs = [];
      
      // First, create jobs for EACH category in EACH priority country (Oman, Japan, Russia)
      // This ensures all categories have jobs in these specific countries
      for (const category of categories) {
        for (const location of priorityLocations) {
          const title = category.titles[Math.floor(Math.random() * category.titles.length)];
          const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
          const expLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
          
          const baseSalary = expLevel === 'ENTRY' ? 150000 : expLevel === 'MID' ? 250000 : expLevel === 'SENIOR' ? 400000 : 600000;
          const salaryVariation = Math.floor(Math.random() * 50000);
          
          jobs.push({
            title: `${title} - ${category.name}`,
            description: `We are seeking a skilled ${title} to join our ${category.name.toLowerCase()} team in ${location.country}. This position offers excellent opportunities for career growth and development in a dynamic work environment. Visa sponsorship available for qualified candidates.`,
            requirements: `${expLevel === 'ENTRY' ? '1-2' : expLevel === 'MID' ? '3-5' : expLevel === 'SENIOR' ? '5-8' : '8+'} years of experience in ${category.name.toLowerCase()}\nRelevant certifications preferred\nStrong communication skills\nAbility to work in a team`,
            responsibilities: `Perform ${category.name.toLowerCase()} tasks according to project specifications\nMaintain quality standards\nFollow safety protocols\nCollaborate with team members\nReport progress to supervisors`,
            benefits: `Competitive salary\nHealth insurance\nAccommodation provided\nAnnual flight tickets\nPaid vacation`,
            location: location.city,
            country: location.country,
            job_type: jobType,
            experience_level: expLevel,
            salary_min: baseSalary + salaryVariation,
            salary_max: baseSalary + salaryVariation + 100000,
            currency: 'INR',
            openings: Math.floor(Math.random() * 10) + 1,
            status: 'ACTIVE',
            visa_sponsorship: true,
            remote_allowed: false,
            employer_id: employerId,
            posted_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Then fill remaining jobs from other locations
      const remainingJobCount = Math.max(0, jobCount - jobs.length);
      for (let i = 0; i < remainingJobCount; i++) {
        const category = categories[i % categories.length];
        const title = category.titles[Math.floor(Math.random() * category.titles.length)];
        const location = otherLocations[i % otherLocations.length];
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const expLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
        
        const baseSalary = expLevel === 'ENTRY' ? 150000 : expLevel === 'MID' ? 250000 : expLevel === 'SENIOR' ? 400000 : 600000;
        const salaryVariation = Math.floor(Math.random() * 50000);
        
        jobs.push({
          title: `${title} - ${category.name}`,
          description: `We are seeking a skilled ${title} to join our ${category.name.toLowerCase()} team in ${location.country}. This position offers excellent opportunities for career growth and development in a dynamic work environment. Visa sponsorship available for qualified candidates.`,
          requirements: `${expLevel === 'ENTRY' ? '1-2' : expLevel === 'MID' ? '3-5' : expLevel === 'SENIOR' ? '5-8' : '8+'} years of experience in ${category.name.toLowerCase()}\nRelevant certifications preferred\nStrong communication skills\nAbility to work in a team`,
          responsibilities: `Perform ${category.name.toLowerCase()} tasks according to project specifications\nMaintain quality standards\nFollow safety protocols\nCollaborate with team members\nReport progress to supervisors`,
          benefits: `Competitive salary\nHealth insurance\nAccommodation provided\nAnnual flight tickets\nPaid vacation`,
          location: location.city,
          country: location.country,
          job_type: jobType,
          experience_level: expLevel,
          salary_min: baseSalary + salaryVariation,
          salary_max: baseSalary + salaryVariation + 100000,
          currency: 'INR',
          openings: Math.floor(Math.random() * 10) + 1,
          status: 'ACTIVE',
          visa_sponsorship: Math.random() > 0.2,
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
      // Check if worker profile exists first
      const { data: existingProfile } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('user_id', workerId)
        .maybeSingle();

      if (!existingProfile) {
        // Create worker profile only if it doesn't exist
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
      } else {
        console.log('Worker profile already exists, skipping creation...');
      }

      // Add skills (only if not already added)
      const { data: existingSkills } = await supabase
        .from('worker_skills')
        .select('id')
        .eq('worker_id', workerId)
        .limit(1);

      if (!existingSkills || existingSkills.length === 0) {
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
      }

      // Add certifications (only if not already added)
      const { data: existingCerts } = await supabase
        .from('worker_certifications')
        .select('id')
        .eq('worker_id', workerId)
        .limit(1);

      if (!existingCerts || existingCerts.length === 0) {
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
      }

      // Add work experience (only if not already added)
      const { data: existingExp } = await supabase
        .from('work_experience')
        .select('id')
        .eq('worker_id', workerId)
        .limit(1);

      if (!existingExp || existingExp.length === 0) {
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

  async seedJobApplications(): Promise<SeedResult> {
    try {
      // Get all worker IDs
      const workerEmails = ['worker@globalgigs.demo', 'worker2@globalgigs.demo', 'worker3@globalgigs.demo'];
      const workerIds: string[] = [];

      for (const email of workerEmails) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (data) workerIds.push(data.id);
      }

      if (workerIds.length === 0) {
        return { success: false, message: 'No worker accounts found for applications' };
      }

      // Get active jobs with their employer IDs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, employer_id, title')
        .eq('status', 'ACTIVE')
        .limit(30);

      if (jobsError || !jobs || jobs.length === 0) {
        return { success: false, message: 'No active jobs found for applications' };
      }

      // Check if applications already exist
      const { data: existingApps } = await supabase
        .from('job_applications')
        .select('id')
        .in('worker_id', workerIds)
        .limit(1);

      if (existingApps && existingApps.length > 0) {
        return { success: true, message: 'Job applications already exist' };
      }

      const statuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'APPROVED', 'REJECTED'];
      const applications = [];

      // Create applications for each worker
      for (let w = 0; w < workerIds.length; w++) {
        const workerId = workerIds[w];
        // Each worker applies to different jobs (5-8 applications each)
        const numApps = 5 + Math.floor(Math.random() * 4);
        const startIndex = w * 10;

        for (let i = 0; i < numApps && (startIndex + i) < jobs.length; i++) {
          const job = jobs[startIndex + i];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const appliedDaysAgo = Math.floor(Math.random() * 30) + 1;

          applications.push({
            job_id: job.id,
            worker_id: workerId,
            employer_id: job.employer_id,
            status,
            cover_letter: `I am excited to apply for the ${job.title} position. With my extensive experience and skills, I believe I would be a valuable addition to your team. I am passionate about this field and eager to contribute to your organization's success.`,
            applied_at: new Date(Date.now() - appliedDaysAgo * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Insert applications
      const { data: insertedApps, error: insertError } = await supabase
        .from('job_applications')
        .insert(applications)
        .select();

      if (insertError) {
        return { success: false, message: 'Failed to create applications', errors: [insertError.message] };
      }

      // Create status history for each application
      if (insertedApps && insertedApps.length > 0) {
        const statusHistory = insertedApps.map(app => ({
          application_id: app.id,
          status: app.status,
          changed_by: app.employer_id,
          notes: app.status === 'PENDING' ? 'Application submitted' : `Status updated to ${app.status}`
        }));

        await supabase.from('application_status_history').insert(statusHistory);
      }

      return {
        success: true,
        message: `Created ${applications.length} job applications for ${workerIds.length} workers`
      };
    } catch (error) {
      console.error('Error seeding job applications:', error);
      return {
        success: false,
        message: 'Failed to seed job applications',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async getEmployerUserIds(): Promise<string[]> {
    try {
      // Try to get employer IDs from profiles table using known demo emails
      const employerEmails = ['employer@globalgigs.demo', 'employer2@globalgigs.demo'];
      const employerIds: string[] = [];

      for (const email of employerEmails) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (data && !error) {
          employerIds.push(data.id);
        }
      }

      // If no demo accounts found, try to get from employer_profiles table
      if (employerIds.length === 0) {
        const { data: epData, error: epError } = await supabase
          .from('employer_profiles')
          .select('user_id')
          .limit(5);

        if (epData && !epError) {
          employerIds.push(...epData.map(ep => ep.user_id));
        }
      }

      // If still none, try user_roles (might work if user is admin)
      if (employerIds.length === 0) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'employer');

        if (roleData && !roleError) {
          employerIds.push(...roleData.map(r => r.user_id));
        }
      }

      console.log(`Found ${employerIds.length} employer accounts`);
      return employerIds;
    } catch (error) {
      console.error('Error getting employer user IDs:', error);
      return [];
    }
  }

  async getWorkerUserId(): Promise<string | null> {
    try {
      // Try known demo worker email first
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'worker@globalgigs.demo')
        .maybeSingle();

      if (data && !error) {
        return data.id;
      }

      // Try to find any worker from worker_profiles
      const { data: wpData, error: wpError } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .limit(1)
        .maybeSingle();

      if (wpData && !wpError) {
        return wpData.user_id;
      }

      console.error('Error getting worker user ID:', error);
      return null;
    } catch (error) {
      console.error('Error getting worker user ID:', error);
      return null;
    }
  }

  async seedAllData(): Promise<SeedResult> {
    const errors: string[] = [];
    const messages: string[] = [];

    // Step 1: Check if accounts already exist, if not create them
    console.log('Step 1: Checking/creating demo accounts...');
    const alreadySeeded = await this.checkIfSeeded();
    
    if (alreadySeeded) {
      console.log('Demo accounts already exist, skipping account creation...');
      messages.push('Using existing demo accounts');
    } else {
      const accountsResult = await this.seedDemoAccounts();
      if (accountsResult.success) {
        messages.push('Demo accounts created');
        // Wait for accounts to be fully created
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        // Even if some accounts fail, try to proceed with existing ones
        console.log('Some accounts may have failed, proceeding with existing accounts...');
      }
    }

    // Step 2: Get employer IDs and seed jobs
    console.log('Step 2: Getting employer IDs and seeding jobs...');
    let employerIds = await this.getEmployerUserIds();
    
    // If no employers found, try to get current user if they are an employer
    if (employerIds.length === 0) {
      console.log('No employers found via queries, checking current user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if current user has employer profile
        const { data: empProfile } = await supabase
          .from('employer_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (empProfile) {
          employerIds = [user.id];
          console.log('Using current logged-in employer for seeding');
        }
      }
    }
    
    if (employerIds.length === 0) {
      errors.push('Could not find any employer accounts. Please log in as an employer to seed jobs, or create demo accounts first.');
    } else {
      console.log(`Found ${employerIds.length} employer accounts`);
      // Distribute jobs across all employers
      const jobsPerEmployer = Math.ceil(100 / employerIds.length);
      let totalJobsCreated = 0;
      
      for (let i = 0; i < employerIds.length; i++) {
        const jobsToCreate = i === employerIds.length - 1 
          ? 100 - (i * jobsPerEmployer) // Last employer gets remaining jobs
          : jobsPerEmployer;
        
        const jobsResult = await this.seedJobsData(employerIds[i], jobsToCreate);
        if (jobsResult.success) {
          totalJobsCreated += jobsToCreate;
        } else {
          errors.push(`Jobs for employer ${i + 1}: ${jobsResult.message}`);
        }
        
        // Small delay between employers
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (totalJobsCreated > 0) {
        messages.push(`${totalJobsCreated} jobs created across ${employerIds.length} employers`);
      }
    }

    // Step 3: Get worker ID and seed worker data (skip if profile already exists)
    console.log('Step 3: Getting worker ID and seeding worker profile...');
    const workerId = await this.getWorkerUserId();
    if (!workerId) {
      errors.push('Could not find worker account');
    } else {
      // Check if worker profile already exists
      const { data: existingProfile } = await supabase
        .from('worker_profiles')
        .select('id')
        .eq('user_id', workerId)
        .maybeSingle();
      
      if (existingProfile) {
        messages.push('Worker profile already exists');
      } else {
        const workerResult = await this.seedWorkerData(workerId);
        if (workerResult.success) {
          messages.push('Worker profile created');
        } else {
          errors.push(`Worker: ${workerResult.message}`);
        }
      }
    }

    // Step 4: Seed job applications for workers
    console.log('Step 4: Seeding job applications...');
    const applicationsResult = await this.seedJobApplications();
    if (applicationsResult.success) {
      messages.push(applicationsResult.message);
    } else if (applicationsResult.errors) {
      errors.push(`Applications: ${applicationsResult.message}`);
    }

    const finalMessage = messages.join('. ') + (messages.length > 0 ? '.' : '');

    if (errors.length > 0) {
      return {
        success: false,
        message: finalMessage || 'Some data failed to seed',
        errors
      };
    }

    return {
      success: true,
      message: finalMessage || 'All demo data seeded successfully!'
    };
  }
}

export const seedService = new SeedService();
