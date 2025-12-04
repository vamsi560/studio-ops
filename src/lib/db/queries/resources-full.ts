import { pool } from '../config';

/**
 * Extended Resource interface matching the full database schema
 */
export interface FullResource {
  vamid: string;
  name: string;
  joiningDate: string;
  grade?: string;
  currentSkill?: string;
  primarySkill?: string;
  totalExp?: number;
  tsc?: string;
  account?: string;
  project?: string;
  allocationStatus?: string;
  allocationStartDate?: string;
  allocationEndDate?: string;
  firstLevelManager?: string;
  designation?: string;
  email?: string;
  subDept?: string;
  relievingDate?: string;
  resignedOn?: string;
  resignationStatus?: string;
  secondLevelManager?: string;
  vamExp?: number;
  accountSummary?: string;
  resourcingUnit?: string;
  workspace?: string;
}

/**
 * Bulk insert resources with all available fields
 * Uses batching to handle large datasets efficiently
 */
export async function createFullResources(resources: FullResource[]): Promise<number> {
  if (resources.length === 0) return 0;

  const BATCH_SIZE = 100; // Insert in batches of 100
  let totalRowsAffected = 0;

  for (let i = 0; i < resources.length; i += BATCH_SIZE) {
    const batch = resources.slice(i, i + BATCH_SIZE);
    
    // Build parameterized query for this batch
    const values: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    batch.forEach((r) => {
      const placeholders: string[] = [];
      // Push all 25 fields in order
      placeholders.push(`$${paramCount++}`);
      params.push(r.vamid);
      placeholders.push(`$${paramCount++}`);
      params.push(r.name);
      placeholders.push(`$${paramCount++}`);
      params.push(r.joiningDate);
      placeholders.push(`$${paramCount++}`);
      params.push(r.grade || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.currentSkill || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.primarySkill || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.totalExp || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.tsc || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.account || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.project || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.allocationStatus || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.allocationStartDate || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.allocationEndDate || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.firstLevelManager || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.designation || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.email || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.subDept || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.relievingDate || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.resignedOn || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.resignationStatus || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.secondLevelManager || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.vamExp || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.accountSummary || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.resourcingUnit || null);
      placeholders.push(`$${paramCount++}`);
      params.push(r.workspace || null);
      
      values.push(`(${placeholders.join(', ')})`);
    });

    const result = await pool.query(`
      INSERT INTO resources (
        vamid, name, joining_date, grade, current_skill, primary_skill, total_exp,
        tsc, account, project, allocation_status, allocation_start_date, allocation_end_date,
        first_level_manager, designation, email, sub_dept, relieving_date, resigned_on,
        resignation_status, second_level_manager, vam_exp, account_summary, resourcing_unit, workspace
      ) VALUES ${values.join(', ')}
      ON CONFLICT (vamid) DO UPDATE SET
        name = EXCLUDED.name,
        joining_date = EXCLUDED.joining_date,
        grade = EXCLUDED.grade,
        current_skill = EXCLUDED.current_skill,
        primary_skill = EXCLUDED.primary_skill,
        total_exp = EXCLUDED.total_exp,
        tsc = EXCLUDED.tsc,
        account = EXCLUDED.account,
        project = EXCLUDED.project,
        allocation_status = EXCLUDED.allocation_status,
        allocation_start_date = EXCLUDED.allocation_start_date,
        allocation_end_date = EXCLUDED.allocation_end_date,
        first_level_manager = EXCLUDED.first_level_manager,
        designation = EXCLUDED.designation,
        email = EXCLUDED.email,
        sub_dept = EXCLUDED.sub_dept,
        relieving_date = EXCLUDED.relieving_date,
        resigned_on = EXCLUDED.resigned_on,
        resignation_status = EXCLUDED.resignation_status,
        second_level_manager = EXCLUDED.second_level_manager,
        vam_exp = EXCLUDED.vam_exp,
        account_summary = EXCLUDED.account_summary,
        resourcing_unit = EXCLUDED.resourcing_unit,
        workspace = EXCLUDED.workspace,
        updated_at = CURRENT_TIMESTAMP
    `, params);

    totalRowsAffected += result.rowCount || 0;
  }

  return totalRowsAffected;
}

