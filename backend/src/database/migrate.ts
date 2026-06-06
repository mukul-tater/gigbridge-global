import { db } from './db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations(): void {
  const onboardingExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='worker_onboarding'")
    .get();

  if (!onboardingExists) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const onboardingBlock = schema.split('CREATE TABLE IF NOT EXISTS worker_onboarding')[1];
    if (onboardingBlock) {
      const sql =
        'CREATE TABLE IF NOT EXISTS worker_onboarding' +
        onboardingBlock.split('CREATE INDEX IF NOT EXISTS idx_worker_onboarding_worker')[0];
      db.exec(sql);
      db.exec(
        'CREATE INDEX IF NOT EXISTS idx_worker_onboarding_worker ON worker_onboarding(worker_id)'
      );
    }
  }
}
