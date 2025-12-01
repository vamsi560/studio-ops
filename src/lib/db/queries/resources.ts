import { pool } from '../config';
import type { Resource } from '@/lib/types';

// Get all resources
export async function getAllResources(): Promise<Resource[]> {
  try {
    const result = await pool.query(`
      SELECT 
        id::text,
        vamid,
        name,
        joining_date::text as "joiningDate",
        grade,
        current_skill as "currentSkill",
        primary_skill as "primarySkill",
        total_exp as "totalExp"
      FROM resources
      ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      vamid: row.vamid,
      name: row.name,
      joiningDate: row.joiningDate,
      grade: row.grade,
      currentSkill: row.currentSkill,
      primarySkill: row.primarySkill,
      totalExp: row.totalExp,
    }));
  } catch (error) {
    console.error('Database query error in getAllResources:', error);
    // If table doesn't exist, return empty array instead of throwing
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Resources table does not exist yet. Returning empty array.');
      return [];
    }
    throw error;
  }
}

// Get resource by ID
export async function getResourceById(id: string): Promise<Resource | null> {
  const result = await pool.query(`
    SELECT 
      id::text,
      vamid,
      name,
      joining_date::text as "joiningDate",
      grade,
      current_skill as "currentSkill",
      primary_skill as "primarySkill",
      total_exp as "totalExp"
    FROM resources
    WHERE id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  };
}

// Get resource by VAMID
export async function getResourceByVamid(vamid: string): Promise<Resource | null> {
  const result = await pool.query(`
    SELECT 
      id::text,
      vamid,
      name,
      joining_date::text as "joiningDate",
      grade,
      current_skill as "currentSkill",
      primary_skill as "primarySkill",
      total_exp as "totalExp"
    FROM resources
    WHERE vamid = $1
  `, [vamid]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  };
}

// Create resource
export async function createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
  const result = await pool.query(`
    INSERT INTO resources (
      vamid, name, joining_date, grade, current_skill, primary_skill, total_exp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (vamid) DO UPDATE SET
      name = EXCLUDED.name,
      joining_date = EXCLUDED.joining_date,
      grade = EXCLUDED.grade,
      current_skill = EXCLUDED.current_skill,
      primary_skill = EXCLUDED.primary_skill,
      total_exp = EXCLUDED.total_exp,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id::text, vamid, name, joining_date::text as "joiningDate", 
              grade, current_skill as "currentSkill", 
              primary_skill as "primarySkill", total_exp as "totalExp"
  `, [
    resource.vamid,
    resource.name,
    resource.joiningDate,
    resource.grade || null,
    resource.currentSkill || null,
    resource.primarySkill || null,
    resource.totalExp || null,
  ]);
  
  const row = result.rows[0];
  return {
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  };
}

// Create multiple resources (for bulk insert)
export async function createResources(resources: Omit<Resource, 'id'>[]): Promise<Resource[]> {
  if (resources.length === 0) return [];
  
  const values = resources.map((r, idx) => {
    const base = idx * 7;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
  }).join(', ');
  
  const params: any[] = [];
  resources.forEach(r => {
    params.push(
      r.vamid,
      r.name,
      r.joiningDate,
      r.grade || null,
      r.currentSkill || null,
      r.primarySkill || null,
      r.totalExp || null
    );
  });
  
  const result = await pool.query(`
    INSERT INTO resources (
      vamid, name, joining_date, grade, current_skill, primary_skill, total_exp
    ) VALUES ${values}
    ON CONFLICT (vamid) DO UPDATE SET
      name = EXCLUDED.name,
      joining_date = EXCLUDED.joining_date,
      grade = EXCLUDED.grade,
      current_skill = EXCLUDED.current_skill,
      primary_skill = EXCLUDED.primary_skill,
      total_exp = EXCLUDED.total_exp,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id::text, vamid, name, joining_date::text as "joiningDate", 
              grade, current_skill as "currentSkill", 
              primary_skill as "primarySkill", total_exp as "totalExp"
  `, params);
  
  return result.rows.map(row => ({
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  }));
}

// Update resource
export async function updateResource(id: string, resource: Partial<Resource>): Promise<Resource | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (resource.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(resource.name);
  }
  if (resource.joiningDate !== undefined) {
    updates.push(`joining_date = $${paramCount++}`);
    values.push(resource.joiningDate);
  }
  if (resource.grade !== undefined) {
    updates.push(`grade = $${paramCount++}`);
    values.push(resource.grade);
  }
  if (resource.currentSkill !== undefined) {
    updates.push(`current_skill = $${paramCount++}`);
    values.push(resource.currentSkill);
  }
  if (resource.primarySkill !== undefined) {
    updates.push(`primary_skill = $${paramCount++}`);
    values.push(resource.primarySkill);
  }
  if (resource.totalExp !== undefined) {
    updates.push(`total_exp = $${paramCount++}`);
    values.push(resource.totalExp);
  }
  
  if (updates.length === 0) {
    return getResourceById(id);
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  
  const result = await pool.query(`
    UPDATE resources
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id::text, vamid, name, joining_date::text as "joiningDate", 
              grade, current_skill as "currentSkill", 
              primary_skill as "primarySkill", total_exp as "totalExp"
  `, values);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  };
}

// Delete resource
export async function deleteResource(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM resources WHERE id = $1', [id]);
  return result.rowCount > 0;
}

// Get resources by VAMIDs (for checking duplicates)
export async function getResourcesByVamids(vamids: string[]): Promise<Resource[]> {
  if (vamids.length === 0) return [];
  
  const result = await pool.query(`
    SELECT 
      id::text,
      vamid,
      name,
      joining_date::text as "joiningDate",
      grade,
      current_skill as "currentSkill",
      primary_skill as "primarySkill",
      total_exp as "totalExp"
    FROM resources
    WHERE vamid = ANY($1::varchar[])
  `, [vamids]);
  
  return result.rows.map(row => ({
    id: row.id,
    vamid: row.vamid,
    name: row.name,
    joiningDate: row.joiningDate,
    grade: row.grade,
    currentSkill: row.currentSkill,
    primarySkill: row.primarySkill,
    totalExp: row.totalExp,
  }));
}

