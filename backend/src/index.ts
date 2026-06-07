import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { runMigrations } from './database/migrate.js';
import { db } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { createApp } from './app.js';

runMigrations();

const stateCount = db.prepare('SELECT COUNT(*) as count FROM states').get() as { count: number };
if (stateCount.count === 0) {
  seedDatabase();
}

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Worker API running on http://localhost:${PORT}`);
});
