import { db } from './db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations(): void {
  let workerColumns = db.prepare('PRAGMA table_info(workers)').all() as { name: string }[];

  if (workerColumns.length > 0 && !workerColumns.some((c) => c.name === 'email')) {
    db.exec('ALTER TABLE workers ADD COLUMN email TEXT');
    db.exec(
      "UPDATE workers SET email = 'worker' || id || '@workers.safeworkglobal.app' WHERE email IS NULL OR email = ''"
    );
    workerColumns = db.prepare('PRAGMA table_info(workers)').all() as { name: string }[];
  }

  if (workerColumns.some((c) => c.name === 'email')) {
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_workers_email ON workers(email)');
  }

  if (workerColumns.length > 0 && !workerColumns.some((c) => c.name === 'mobile_verified')) {
    db.exec('ALTER TABLE workers ADD COLUMN mobile_verified INTEGER NOT NULL DEFAULT 0');
  }

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
