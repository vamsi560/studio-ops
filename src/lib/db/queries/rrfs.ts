import { pool } from '../config';

export interface RRF {
  id: number;
  rrfId: string;
  posTitle?: string;
  role?: string;
  account?: string;
  project?: string;
  description?: string;
  skillsRequired?: string;
  experienceRequired?: number;
  grade?: string;
  location?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create RRF
export async function createRRF(data: {
  rrfId: string;
  posTitle?: string;
  role?: string;
  account?: string;
  project?: string;
  description?: string;
  skillsRequired?: string;
  experienceRequired?: number;
  grade?: string;
  location?: string;
  status?: string;
}): Promise<RRF> {
  const result = await pool.query(`
    INSERT INTO rrfs (
      rrf_id, pos_title, role, account, project, description, 
      skills_required, experience_required, grade, location, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (rrf_id) DO UPDATE SET
      pos_title = EXCLUDED.pos_title,
      role = EXCLUDED.role,
      account = EXCLUDED.account,
      project = EXCLUDED.project,
      description = EXCLUDED.description,
      skills_required = EXCLUDED.skills_required,
      experience_required = EXCLUDED.experience_required,
      grade = EXCLUDED.grade,
      location = EXCLUDED.location,
      status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP
    RETURNING 
      id,
      rrf_id as "rrfId",
      pos_title as "posTitle",
      role,
      account,
      project,
      description,
      skills_required as "skillsRequired",
      experience_required as "experienceRequired",
      grade,
      location,
      status,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [
    data.rrfId,
    data.posTitle || null,
    data.role || null,
    data.account || null,
    data.project || null,
    data.description || null,
    data.skillsRequired || null,
    data.experienceRequired || null,
    data.grade || null,
    data.location || null,
    data.status || 'open',
  ]);

  return result.rows[0];
}

// Create multiple RRFs (bulk insert)
export async function createRRFs(rrfs: Array<{
  rrfId: string;
  posTitle?: string;
  role?: string;
  account?: string;
  project?: string;
  description?: string;
  skillsRequired?: string;
  experienceRequired?: number;
  grade?: string;
  location?: string;
  status?: string;
}>): Promise<RRF[]> {
  if (rrfs.length === 0) return [];

  // Build parameterized query for bulk insert
  const values: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  rrfs.forEach((rrf) => {
    values.push(
      `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`
    );
    params.push(
      rrf.rrfId,
      rrf.posTitle || null,
      rrf.role || null,
      rrf.account || null,
      rrf.project || null,
      rrf.description || null,
      rrf.skillsRequired || null,
      rrf.experienceRequired || null,
      rrf.grade || null,
      rrf.location || null,
      rrf.status || 'open'
    );
  });

  const result = await pool.query(`
    INSERT INTO rrfs (
      rrf_id, pos_title, role, account, project, description, 
      skills_required, experience_required, grade, location, status
    ) VALUES ${values.join(', ')}
    ON CONFLICT (rrf_id) DO UPDATE SET
      pos_title = EXCLUDED.pos_title,
      role = EXCLUDED.role,
      account = EXCLUDED.account,
      project = EXCLUDED.project,
      description = EXCLUDED.description,
      skills_required = EXCLUDED.skills_required,
      experience_required = EXCLUDED.experience_required,
      grade = EXCLUDED.grade,
      location = EXCLUDED.location,
      status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP
    RETURNING 
      id,
      rrf_id as "rrfId",
      pos_title as "posTitle",
      role,
      account,
      project,
      description,
      skills_required as "skillsRequired",
      experience_required as "experienceRequired",
      grade,
      location,
      status,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, params);

  return result.rows;
}

// Get all RRFs
export async function getAllRRFs(): Promise<RRF[]> {
  const result = await pool.query(`
    SELECT 
      id,
      rrf_id as "rrfId",
      pos_title as "posTitle",
      role,
      account,
      project,
      description,
      skills_required as "skillsRequired",
      experience_required as "experienceRequired",
      grade,
      location,
      status,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM rrfs
    ORDER BY created_at DESC
  `);

  return result.rows;
}

