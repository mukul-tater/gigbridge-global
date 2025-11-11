import type { MockDataStore, User, WorkerProfile, Company, Factory, Skill, WorkerSkill, Certification, MediaAsset, Job, Application } from '@/types/mock-data';

const STORAGE_KEY = 'gigworker_demo_data';
const DEMO_MODE = true;

class MockDataService {
  private data: MockDataStore | null = null;
  private initialized = false;

  // Initialize data from localStorage or load from JSON files
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      try {
        this.data = JSON.parse(storedData);
        this.initialized = true;
        console.log('📦 Mock data loaded from localStorage');
        return;
      } catch (error) {
        console.error('Failed to parse stored data, loading from JSON files', error);
      }
    }

    await this.loadFromJSON();
  }

  // Load data from JSON files
  private async loadFromJSON(): Promise<void> {
    try {
      const [
        users,
        workers,
        companies,
        factories,
        skills,
        workerSkills,
        certifications,
        mediaAssets,
        jobs,
        applications
      ] = await Promise.all([
        fetch('/mock/users.json').then(r => r.json()),
        fetch('/mock/workers.json').then(r => r.json()),
        fetch('/mock/companies.json').then(r => r.json()),
        fetch('/mock/factories.json').then(r => r.json()),
        fetch('/mock/skills.json').then(r => r.json()),
        fetch('/mock/worker_skills.json').then(r => r.json()),
        fetch('/mock/certifications.json').then(r => r.json()),
        fetch('/mock/media_assets.json').then(r => r.json()),
        fetch('/mock/jobs.json').then(r => r.json()),
        fetch('/mock/applications.json').then(r => r.json())
      ]);

      this.data = {
        users,
        workers,
        companies,
        factories,
        skills,
        workerSkills,
        certifications,
        mediaAssets,
        jobs,
        applications,
        trainings: [],
        contracts: [],
        travelDocuments: [],
        insurancePolicies: [],
        remittances: []
      };

      this.saveToLocalStorage();
      this.initialized = true;
      console.log('✅ Mock data loaded from JSON files');
    } catch (error) {
      console.error('Failed to load mock data from JSON files', error);
      throw new Error('Failed to initialize mock data');
    }
  }

  // Save current state to localStorage
  private saveToLocalStorage(): void {
    if (this.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  // Reset demo - reload from JSON and clear localStorage
  async resetDemo(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.initialized = false;
    this.data = null;
    await this.loadFromJSON();
    console.log('🔄 Demo data reset');
  }

  // Get all data
  getData(): MockDataStore {
    if (!this.data) {
      throw new Error('MockDataService not initialized');
    }
    return this.data;
  }

  // === USERS ===
  getUsers(): User[] {
    return this.getData().users;
  }

  getUserById(id: string): User | undefined {
    return this.getData().users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getData().users.find(u => u.email === email);
  }

  createUser(user: User): User {
    this.getData().users.push(user);
    this.saveToLocalStorage();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getData().users;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    users[index] = { ...users[index], ...updates };
    this.saveToLocalStorage();
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getData().users;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === WORKERS ===
  getWorkers(): WorkerProfile[] {
    return this.getData().workers;
  }

  getWorkerById(id: string): WorkerProfile | undefined {
    return this.getData().workers.find(w => w.id === id);
  }

  getWorkerByUserId(userId: string): WorkerProfile | undefined {
    return this.getData().workers.find(w => w.userId === userId);
  }

  createWorker(worker: WorkerProfile): WorkerProfile {
    this.getData().workers.push(worker);
    this.saveToLocalStorage();
    return worker;
  }

  updateWorker(id: string, updates: Partial<WorkerProfile>): WorkerProfile | undefined {
    const workers = this.getData().workers;
    const index = workers.findIndex(w => w.id === id);
    if (index === -1) return undefined;

    workers[index] = { ...workers[index], ...updates };
    this.saveToLocalStorage();
    return workers[index];
  }

  deleteWorker(id: string): boolean {
    const workers = this.getData().workers;
    const index = workers.findIndex(w => w.id === id);
    if (index === -1) return false;

    workers.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === COMPANIES ===
  getCompanies(): Company[] {
    return this.getData().companies;
  }

  getCompanyById(id: string): Company | undefined {
    return this.getData().companies.find(c => c.id === id);
  }

  getCompaniesByEmployerId(employerId: string): Company[] {
    return this.getData().companies.filter(c => c.employerId === employerId);
  }

  createCompany(company: Company): Company {
    this.getData().companies.push(company);
    this.saveToLocalStorage();
    return company;
  }

  updateCompany(id: string, updates: Partial<Company>): Company | undefined {
    const companies = this.getData().companies;
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    companies[index] = { ...companies[index], ...updates };
    this.saveToLocalStorage();
    return companies[index];
  }

  deleteCompany(id: string): boolean {
    const companies = this.getData().companies;
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return false;

    companies.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === FACTORIES ===
  getFactories(): Factory[] {
    return this.getData().factories;
  }

  getFactoryById(id: string): Factory | undefined {
    return this.getData().factories.find(f => f.id === id);
  }

  getFactoriesByCompanyId(companyId: string): Factory[] {
    return this.getData().factories.filter(f => f.companyId === companyId);
  }

  createFactory(factory: Factory): Factory {
    this.getData().factories.push(factory);
    this.saveToLocalStorage();
    return factory;
  }

  updateFactory(id: string, updates: Partial<Factory>): Factory | undefined {
    const factories = this.getData().factories;
    const index = factories.findIndex(f => f.id === id);
    if (index === -1) return undefined;

    factories[index] = { ...factories[index], ...updates };
    this.saveToLocalStorage();
    return factories[index];
  }

  deleteFactory(id: string): boolean {
    const factories = this.getData().factories;
    const index = factories.findIndex(f => f.id === id);
    if (index === -1) return false;

    factories.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === SKILLS ===
  getSkills(): Skill[] {
    return this.getData().skills;
  }

  getSkillById(id: string): Skill | undefined {
    return this.getData().skills.find(s => s.id === id);
  }

  // === WORKER SKILLS ===
  getWorkerSkills(): WorkerSkill[] {
    return this.getData().workerSkills;
  }

  getWorkerSkillsByWorkerId(workerId: string): WorkerSkill[] {
    return this.getData().workerSkills.filter(ws => ws.workerId === workerId);
  }

  createWorkerSkill(workerSkill: WorkerSkill): WorkerSkill {
    this.getData().workerSkills.push(workerSkill);
    this.saveToLocalStorage();
    return workerSkill;
  }

  deleteWorkerSkill(id: string): boolean {
    const workerSkills = this.getData().workerSkills;
    const index = workerSkills.findIndex(ws => ws.id === id);
    if (index === -1) return false;

    workerSkills.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === CERTIFICATIONS ===
  getCertifications(): Certification[] {
    return this.getData().certifications;
  }

  getCertificationsByWorkerId(workerId: string): Certification[] {
    return this.getData().certifications.filter(c => c.workerId === workerId);
  }

  createCertification(certification: Certification): Certification {
    this.getData().certifications.push(certification);
    this.saveToLocalStorage();
    return certification;
  }

  deleteCertification(id: string): boolean {
    const certifications = this.getData().certifications;
    const index = certifications.findIndex(c => c.id === id);
    if (index === -1) return false;

    certifications.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === MEDIA ASSETS ===
  getMediaAssets(): MediaAsset[] {
    return this.getData().mediaAssets;
  }

  getMediaAssetsByWorkerId(workerId: string): MediaAsset[] {
    return this.getData().mediaAssets.filter(m => m.workerId === workerId);
  }

  createMediaAsset(mediaAsset: MediaAsset): MediaAsset {
    this.getData().mediaAssets.push(mediaAsset);
    this.saveToLocalStorage();
    return mediaAsset;
  }

  deleteMediaAsset(id: string): boolean {
    const mediaAssets = this.getData().mediaAssets;
    const index = mediaAssets.findIndex(m => m.id === id);
    if (index === -1) return false;

    mediaAssets.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === JOBS ===
  getJobs(): Job[] {
    return this.getData().jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.getData().jobs.find(j => j.id === id);
  }

  getJobsByCompanyId(companyId: string): Job[] {
    return this.getData().jobs.filter(j => j.companyId === companyId);
  }

  getActiveJobs(): Job[] {
    return this.getData().jobs.filter(j => j.status === 'ACTIVE');
  }

  createJob(job: Job): Job {
    this.getData().jobs.push(job);
    this.saveToLocalStorage();
    return job;
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const jobs = this.getData().jobs;
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) return undefined;

    jobs[index] = { ...jobs[index], ...updates };
    this.saveToLocalStorage();
    return jobs[index];
  }

  deleteJob(id: string): boolean {
    const jobs = this.getData().jobs;
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) return false;

    jobs.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // === APPLICATIONS ===
  getApplications(): Application[] {
    return this.getData().applications;
  }

  getApplicationById(id: string): Application | undefined {
    return this.getData().applications.find(a => a.id === id);
  }

  getApplicationsByWorkerId(workerId: string): Application[] {
    return this.getData().applications.filter(a => a.workerId === workerId);
  }

  getApplicationsByJobId(jobId: string): Application[] {
    return this.getData().applications.filter(a => a.jobId === jobId);
  }

  getApplicationByWorkerAndJob(workerId: string, jobId: string): Application | undefined {
    return this.getData().applications.find(
      a => a.workerId === workerId && a.jobId === jobId
    );
  }

  createApplication(application: Application): Application {
    this.getData().applications.push(application);
    this.saveToLocalStorage();
    return application;
  }

  updateApplication(id: string, updates: Partial<Application>): Application | undefined {
    const applications = this.getData().applications;
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    applications[index] = { ...applications[index], ...updates };
    this.saveToLocalStorage();
    return applications[index];
  }

  deleteApplication(id: string): boolean {
    const applications = this.getData().applications;
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) return false;

    applications.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // Check if demo mode is enabled
  isDemoMode(): boolean {
    return DEMO_MODE;
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
