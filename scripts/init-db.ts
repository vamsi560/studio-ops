import { pool } from '../src/lib/db/config';
import { initializeDatabase } from '../src/lib/db/init';

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

