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

-- Create index on vamid for fast lookups
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

-- Dashboard metrics table (optional, for caching aggregated metrics)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id SERIAL PRIMARY KEY,
    total_bench INTEGER DEFAULT 0,
    on_bench_90_plus INTEGER DEFAULT 0,
    high_experience_count INTEGER DEFAULT 0,
    new_this_month INTEGER DEFAULT 0,
    top_skill VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial dashboard metrics record
INSERT INTO dashboard_metrics (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

