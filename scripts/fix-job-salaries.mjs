#!/usr/bin/env node
/**
 * Bulk-update active job salaries to ₹50K–₹1L/month.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (never commit this key).
 *
 * Usage: node scripts/fix-job-salaries.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
    }
  } catch {
    /* no .env */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    'Missing VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env\n' +
      'Alternatively: run supabase/migrations/20260606120000_normalize_job_salaries.sql in Supabase SQL Editor,\n' +
      'or log in as admin → /seed-data → Fix All Job Salaries.'
  );
  process.exit(1);
}

const SALARY_FLOOR = 50_000;
const SALARY_CEILING = 100_000;
const LEVEL_OFFSET = { ENTRY: 0, INTERMEDIATE: 3_000, SENIOR: 6_000, EXPERT: 9_000 };

function formatAmount(n) {
  if (n >= 100_000) {
    const lakhs = n / 100_000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${Math.round(n / 1000)}K`;
}

function normalizeSalary(experienceLevel, seed) {
  const offset = LEVEL_OFFSET[experienceLevel] ?? 3_000;
  const jitter = seed % 5_000;
  const salary_min = Math.min(SALARY_FLOOR + offset + jitter, SALARY_CEILING - 15_000);
  const salary_max = Math.min(SALARY_CEILING, salary_min + 5_000 + (seed % 10_000));
  const max = Math.max(salary_max, salary_min + 5_000);
  return {
    salary_min,
    salary_max: max,
    currency: 'INR',
    salary_display: `${formatAmount(salary_min)} – ${formatAmount(max)}`,
  };
}

const sb = createClient(url, key);

const { data: jobs, error } = await sb.from('jobs').select('id, experience_level').eq('status', 'ACTIVE');

if (error) {
  console.error('Fetch failed:', error.message);
  process.exit(1);
}

if (!jobs?.length) {
  console.log('No active jobs found.');
  process.exit(0);
}

let updated = 0;
for (const job of jobs) {
  const seed = job.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const salary = normalizeSalary(job.experience_level, seed);
  const { error: uerr } = await sb.from('jobs').update(salary).eq('id', job.id);
  if (uerr) console.error(job.id, uerr.message);
  else updated++;
}

console.log(`Updated ${updated} of ${jobs.length} active jobs to ₹50K–₹1L/month.`);
