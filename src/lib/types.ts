export interface Resource {
  vamid: string;
  name: string;
  joiningDate: string; // YYYY-MM-DD
  grade: string;
  currentSkill: string;
  primarySkill: string;
  totalExp?: number;
}

export type BenchAgeingData = {
  '0-30': number;
  '31-60': number;
  '61-90': number;
  more_than_90: number;
};
