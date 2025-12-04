import * as XLSX from 'xlsx';

/**
 * Maps Excel data row to RRF database record
 */
export function mapExcelRowToRRF(row: any): {
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
} {
  return {
    rrfId: String(row["RRF ID"] || row["RRFID"] || row["RRF_ID"] || row["RRFID"] || ''),
    posTitle: row["POS Title"] || row["POSTitle"] || row["POS_Title"] || row["Position Title"] || undefined,
    role: row["Role"] || row["Role Name"] || undefined,
    account: row["Account"] || row["Account Name"] || row["AccountName"] || undefined,
    project: row["Project"] || row["Project Name"] || undefined,
    description: row["Description"] || row["Job Description"] || undefined,
    skillsRequired: row["Skills Required"] || row["SkillsRequired"] || row["Required Skills"] || row["Skill"] || undefined,
    experienceRequired: row["Experience Required"] || row["ExperienceRequired"] ? Number(row["Experience Required"] || row["ExperienceRequired"]) : undefined,
    grade: row["Grade"] || row["Level"] || undefined,
    location: row["Location"] || row["Work Location"] || undefined,
  };
}

/**
 * Maps Excel data row to Resource database record
 * Handles flexible column name matching
 */
export function mapExcelRowToResource(row: any): {
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
} | null {
  // VAMID and Name are required
  const vamid = row["VAMID"] || row["VAM ID"] || row["VAM_ID"];
  const name = row["Name"] || row["Full Name"] || row["FullName"];
  const joiningDate = row["Joining Date"] || row["JoiningDate"] || row["Joining_Date"] || row["Date of Joining"];

  if (!vamid || !name) {
    return null; // Skip invalid rows
  }

  // Parse joining date
  let parsedJoiningDate = '';
  if (joiningDate) {
    if (typeof joiningDate === 'number') {
      const date = XLSX.SSF.parse_date_code(joiningDate);
      parsedJoiningDate = new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    } else if (typeof joiningDate === 'string') {
      const parsedDate = new Date(joiningDate);
      if (!isNaN(parsedDate.getTime())) {
        parsedJoiningDate = parsedDate.toISOString().split('T')[0];
      }
    }
  }

  if (!parsedJoiningDate) {
    return null; // Joining date is required
  }

  // Helper function to parse dates
  const parseDate = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    } else if (typeof value === 'string') {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    return undefined;
  };

  return {
    vamid: String(vamid),
    name: String(name),
    joiningDate: parsedJoiningDate,
    grade: row["Grade"] || row["Level"] || undefined,
    currentSkill: row["Current Skill"] || row["CurrentSkill"] || row["Current_Skill"] || row["Skill"] || undefined,
    primarySkill: row["Primary Skill"] || row["PrimarySkill"] || row["Primary_Skill"] || undefined,
    totalExp: row["Total Exp"] || row["TotalExp"] || row["Total_Exp"] || row["Experience"] ? Number(row["Total Exp"] || row["TotalExp"] || row["Total_Exp"] || row["Experience"]) : undefined,
    tsc: row["TSC"] || undefined,
    account: row["Account"] || row["Account Name"] || row["AccountName"] || undefined,
    project: row["Project"] || row["Project Name"] || undefined,
    allocationStatus: row["Allocation Status"] || row["AllocationStatus"] || row["Allocation_Status"] || row["Status"] || undefined,
    allocationStartDate: parseDate(row["Allocation Start Date"] || row["AllocationStartDate"] || row["Allocation_Start_Date"]),
    allocationEndDate: parseDate(row["Allocation End Date"] || row["AllocationEndDate"] || row["Allocation_End_Date"]),
    firstLevelManager: row["First Level Manager"] || row["FirstLevelManager"] || row["First_Level_Manager"] || row["Manager"] || undefined,
    designation: row["Designation"] || row["Title"] || undefined,
    email: row["Email"] || row["Email ID"] || row["EmailID"] || undefined,
    subDept: row["Sub dept"] || row["SubDept"] || row["Sub_Dept"] || row["Department"] || undefined,
    relievingDate: parseDate(row["Relieving Date"] || row["RelievingDate"] || row["Relieving_Date"]),
    resignedOn: parseDate(row["Resigned on"] || row["ResignedOn"] || row["Resigned_On"] || row["Resignation Date"]),
    resignationStatus: row["Resignation Status"] || row["ResignationStatus"] || row["Resignation_Status"] || undefined,
    secondLevelManager: row["Second Level Manager"] || row["SecondLevelManager"] || row["Second_Level_Manager"] || undefined,
    vamExp: row["VAM Exp"] || row["VAMExp"] || row["VAM_Exp"] ? Number(row["VAM Exp"] || row["VAMExp"] || row["VAM_Exp"]) : undefined,
    accountSummary: row["Account Summary"] || row["AccountSummary"] || row["Account_Summary"] || undefined,
    resourcingUnit: row["Resourcing unit"] || row["ResourcingUnit"] || row["Resourcing_Unit"] || row["Unit"] || undefined,
    workspace: row["Workspace"] || row["Work Location"] || undefined,
  };
}

