import { createApp } from './app.js';
import { db } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { runMigrations } from './database/migrate.js';

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
