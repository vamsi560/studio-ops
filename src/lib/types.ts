export interface Resource {
  vamid: string;
  name: string;
  joiningDate: string; // YYYY-MM-DD
  grade: string;
  currentSkill: string;
  primarySkill: string;
}

export type BenchAgeingData = {
  '0-30': number;
  '31-60': number;
  '61-90': more_than_90: number;
};
