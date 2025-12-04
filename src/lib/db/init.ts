import { pool } from './config';

// SQL schema as a constant (better for Next.js)
const SCHEMA_SQL = `
-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    vamid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL,
    grade VARCHAR(50),
    current_skill VARCHAR(255),
    primary_skill VARCHAR(255),
    total_exp INTEGER,
    tsc VARCHAR(255),
    account VARCHAR(255),
    project VARCHAR(255),
    allocation_status VARCHAR(255),
    allocation_start_date DATE,
    allocation_end_date DATE,
    first_level_manager VARCHAR(255),
    designation VARCHAR(255),
    email VARCHAR(255),
    sub_dept VARCHAR(255),
    relieving_date DATE,
    resigned_on DATE,
    resignation_status VARCHAR(255),
    second_level_manager VARCHAR(255),
    vam_exp INTEGER,
    account_summary TEXT,
    resourcing_unit VARCHAR(255),
    workspace VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resources_vamid ON resources(vamid);
CREATE INDEX IF NOT EXISTS idx_resources_joining_date ON resources(joining_date);
CREATE INDEX IF NOT EXISTS idx_resources_grade ON resources(grade);
CREATE INDEX IF NOT EXISTS idx_resources_primary_skill ON resources(primary_skill);

-- Excel uploads table
CREATE TABLE IF NOT EXISTS excel_uploads (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255),
    rows_processed INTEGER,
    status VARCHAR(50) DEFAULT 'completed'
);

-- Dashboard metrics table
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_bench INTEGER DEFAULT 0,
    on_bench_90_plus INTEGER DEFAULT 0,
    high_experience_count INTEGER DEFAULT 0,
    new_this_month INTEGER DEFAULT 0,
    top_skill VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial dashboard metrics record
INSERT INTO dashboard_metrics (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RRFs table for storing RRF (Resource Request Form) data
CREATE TABLE IF NOT EXISTS rrfs (
    id SERIAL PRIMARY KEY,
    rrf_id VARCHAR(255) UNIQUE NOT NULL,
    pos_title VARCHAR(255),
    role VARCHAR(255),
    account VARCHAR(255),
    project VARCHAR(255),
    description TEXT,
    skills_required TEXT,
    experience_required INTEGER,
    grade VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rrfs table
CREATE INDEX IF NOT EXISTS idx_rrfs_rrf_id ON rrfs(rrf_id);
CREATE INDEX IF NOT EXISTS idx_rrfs_account ON rrfs(account);
CREATE INDEX IF NOT EXISTS idx_rrfs_status ON rrfs(status);
`;

export async function initializeDatabase() {
  try {
    // Execute schema
    await pool.query(SCHEMA_SQL);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Call this on server startup (in Next.js API route or server component)
export async function ensureDatabaseInitialized() {
  try {
    // Check if resources table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('Database tables not found, initializing...');
      await initializeDatabase();
      console.log('Database initialization completed');
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Error checking database:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If table doesn't exist error, try to initialize
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      console.log('Table check failed, attempting initialization...');
      try {
        await initializeDatabase();
        console.log('Database initialization completed after error');
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        throw initError; // Re-throw to be handled by caller
      }
    } else {
      // For other errors (connection issues, etc.), throw them
      throw error;
    }
  }
}

