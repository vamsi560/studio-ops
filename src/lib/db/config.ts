import { Pool } from 'pg';

// Hardcoded database connection string
const connectionString = 'postgresql://retool:npg_UWqxdlf1LmS7@ep-round-breeze-af1fyksh.c-2.us-west-2.retooldb.com/retool?sslmode=require';

// Create connection pool
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Retool database
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

