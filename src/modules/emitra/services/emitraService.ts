import { supabase as supabaseTyped } from '@/integrations/supabase/client';
// Many tables referenced here (partner_workers, partner_activities, partner_incentives,
// partner_worker_status_history) and the partner-worker-media bucket are not yet in the
// generated types. Use an untyped client to avoid TS schema errors until migrations land.
const supabase: any = supabaseTyped;
import { calculateMigrationScore, getMigrationCategory } from '../lib/migrationScore';
import type {
  DashboardStats,
  PartnerActivity,
  PartnerIncentive,
  PartnerProfile,
  PartnerWorker,
  WorkerStatusHistory,
} from '../types/emitra.types';

export async function getPartnerProfile(userId: string): Promise<PartnerProfile | null> {
  const { data } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data as PartnerProfile | null;
}

export type PartnerApplicationPayload = Partial<
  Omit<PartnerProfile, 'id' | 'user_id' | 'status' | 'partner_code' | 'tier'>
> & {
  current_step?: number;
  submitted_at?: string | null;
  status?: string;
};

function mapPartnerProfileError(error: { code?: string; message?: string }): Error {
  const message = error.message || 'Failed to save partner application';

  if (
    error.code === 'PGRST204'
    || /could not find the '.*' column/i.test(message)
  ) {
    return new Error(
      'Partner database is missing E-Mitra columns. Run supabase migration 20260607180000_partner_profiles_emitra_columns.sql in the Supabase SQL editor, then retry.',
    );
  }

  if (error.code === '42501' || /row-level security/i.test(message)) {
    return new Error('You do not have permission to save this application. Please sign in again.');
  }

  return new Error(message);
}

/** Update or insert partner_profiles without PostgREST upsert (more reliable with RLS). */
export async function savePartnerApplication(
  userId: string,
  payload: PartnerApplicationPayload,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('partner_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) throw mapPartnerProfileError(fetchError);

  const row = { user_id: userId, ...payload };

  if (existing) {
    const { error } = await supabase
      .from('partner_profiles')
      .update(row)
      .eq('user_id', userId);
    if (error) throw mapPartnerProfileError(error);
    return;
  }

  const { error } = await supabase.from('partner_profiles').insert(row);
  if (error) throw mapPartnerProfileError(error);
}

export function isPartnerOperational(profile: PartnerProfile | null): boolean {
  return !!profile && (profile.status === 'approved' || profile.status === 'active');
}

export async function getDashboardStats(partnerProfileId: string): Promise<DashboardStats> {
  const { data: workers } = await supabase
    .from('partner_workers')
    .select('status')
    .eq('partner_profile_id', partnerProfileId);

  const list = workers || [];
  const { data: profile } = await supabase
    .from('partner_profiles')
    .select('total_incentives_earned')
    .eq('id', partnerProfileId)
    .single();

  return {
    totalRegistered: list.length,
    verified: list.filter(w => w.status !== 'registered').length,
    interviewed: list.filter(w => ['interviewed', 'selected', 'placed'].includes(w.status)).length,
    selected: list.filter(w => ['selected', 'placed'].includes(w.status)).length,
    placed: list.filter(w => w.status === 'placed').length,
    incentivesEarned: Number(profile?.total_incentives_earned || 0),
  };
}

export async function getPartnerActivities(partnerProfileId: string, limit = 10): Promise<PartnerActivity[]> {
  const { data } = await supabase
    .from('partner_activities')
    .select('*')
    .eq('partner_profile_id', partnerProfileId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []) as PartnerActivity[];
}

export async function getPartnerIncentives(partnerProfileId: string): Promise<PartnerIncentive[]> {
  const { data } = await supabase
    .from('partner_incentives')
    .select('*')
    .eq('partner_profile_id', partnerProfileId)
    .order('created_at', { ascending: false });
  return (data || []) as PartnerIncentive[];
}

export async function getLeaderboardRank(partnerProfileId: string): Promise<number | null> {
  const { data } = await supabase
    .from('partner_profiles')
    .select('id, workers_placed')
    .in('status', ['approved', 'active'])
    .order('workers_placed', { ascending: false });

  if (!data) return null;
  const idx = data.findIndex(p => p.id === partnerProfileId);
  return idx >= 0 ? idx + 1 : null;
}

export interface WorkerFilters {
  skill?: string;
  state?: string;
  district?: string;
  status?: string;
  passportAvailable?: string;
  search?: string;
}

export async function getPartnerWorkers(
  partnerProfileId: string,
  filters: WorkerFilters = {}
): Promise<PartnerWorker[]> {
  let query = supabase
    .from('partner_workers')
    .select('*')
    .eq('partner_profile_id', partnerProfileId)
    .order('created_at', { ascending: false });

  if (filters.skill && filters.skill !== 'all') query = query.eq('skill', filters.skill);
  if (filters.state && filters.state !== 'all') query = query.eq('state', filters.state);
  if (filters.district && filters.district !== 'all') query = query.eq('district', filters.district);
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.passportAvailable === 'yes') query = query.eq('passport_available', true);
  if (filters.passportAvailable === 'no') query = query.eq('passport_available', false);

  const { data } = await query;
  let results = (data || []) as PartnerWorker[];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter(
      w =>
        w.full_name.toLowerCase().includes(q) ||
        w.mobile.includes(q) ||
        w.skill.toLowerCase().includes(q)
    );
  }
  return results;
}

export async function getWorkerById(workerId: string): Promise<PartnerWorker | null> {
  const { data } = await supabase
    .from('partner_workers')
    .select('*')
    .eq('id', workerId)
    .maybeSingle();
  return data as PartnerWorker | null;
}

export async function getWorkerStatusHistory(workerId: string): Promise<WorkerStatusHistory[]> {
  const { data } = await supabase
    .from('partner_worker_status_history')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: true });
  return (data || []) as WorkerStatusHistory[];
}

export async function createPartnerWorker(
  partnerProfileId: string,
  payload: Record<string, unknown>
): Promise<{ worker: PartnerWorker | null; error?: string }> {
  const migrationAnswers = {
    passportAvailable: !!payload.passport_available,
    readyToRelocate: !!payload.ready_to_relocate,
    familyConsent: !!payload.family_consent,
    previousGccExperience: !!payload.previous_gcc_experience,
    expectedSalary: payload.expected_salary as number | null,
  };
  const score = calculateMigrationScore(migrationAnswers);
  const category = getMigrationCategory(score);

  const { data, error } = await supabase
    .from('partner_workers')
    .insert({
      partner_profile_id: partnerProfileId,
      full_name: payload.full_name,
      mobile: payload.mobile,
      whatsapp: payload.whatsapp,
      skill: payload.skill,
      experience_level: payload.experience_level,
      passport_available: payload.passport_available,
      preferred_country: payload.preferred_country || null,
      state: payload.state,
      district: payload.district,
      skill_level: payload.skill_level || null,
      operator_notes: payload.operator_notes || null,
      ready_to_relocate: payload.ready_to_relocate,
      family_consent: payload.family_consent,
      previous_gcc_experience: payload.previous_gcc_experience,
      expected_salary: payload.expected_salary || null,
      migration_readiness_score: score,
      migration_category: category,
      photo_url: payload.photo_url || null,
      video_url: payload.video_url || null,
      status: 'registered',
    })
    .select()
    .single();

  if (error) return { worker: null, error: error.message };
  return { worker: data as PartnerWorker };
}

export async function updatePartnerWorker(
  workerId: string,
  payload: Record<string, unknown>
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('partner_workers')
    .update(payload)
    .eq('id', workerId);
  return error ? { error: error.message } : {};
}

export async function updateWorkerStatus(
  workerId: string,
  status: string
): Promise<{ error?: string }> {
  return updatePartnerWorker(workerId, { status });
}

function complianceStorageKey(profileId: string) {
  return `emitra_compliance_ack:${profileId}`;
}

export function isComplianceAcknowledged(profile: PartnerProfile): boolean {
  if (profile.compliance_acknowledged_at) return true;
  try {
    return localStorage.getItem(complianceStorageKey(profile.id)) === '1';
  } catch {
    return false;
  }
}

export async function acknowledgeCompliance(partnerProfileId: string): Promise<{ error?: string }> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('partner_profiles')
    .update({ compliance_acknowledged_at: now, updated_at: now })
    .eq('id', partnerProfileId);

  if (!error) return {};

  try {
    localStorage.setItem(complianceStorageKey(partnerProfileId), '1');
    return {};
  } catch {
    return { error: error.message };
  }
}

export async function uploadWorkerMedia(
  userId: string,
  file: File,
  type: 'photo' | 'video'
): Promise<{ path: string | null; error?: string }> {
  if (file.size > (type === 'video' ? 50 : 8) * 1024 * 1024) {
    return { path: null, error: `File must be under ${type === 'video' ? 50 : 8} MB` };
  }
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('partner-worker-media')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { path: null, error: error.message };
  return { path };
}

export async function getSignedMediaUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('partner-worker-media')
    .createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}
