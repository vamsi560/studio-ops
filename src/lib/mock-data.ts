import { subDays } from 'date-fns';
import type { Resource } from './types';

const today = new Date();

export const ALL_RESOURCES: Resource[] = [
  { vamid: 'VAM1001', name: 'Aarav Sharma', joiningDate: subDays(today, 15).toISOString().split('T')[0], grade: 'G7', currentSkill: 'React', primarySkill: 'React' },
  { vamid: 'VAM1002', name: 'Diya Patel', joiningDate: subDays(today, 25).toISOString().split('T')[0], grade: 'G8', currentSkill: 'Angular', primarySkill: 'Java' },
  { vamid: 'VAM1003', name: 'Vihaan Singh', joiningDate: subDays(today, 40).toISOString().split('T')[0], grade: 'G7', currentSkill: 'Vue.js', primarySkill: 'JavaScript' },
  { vamid: 'VAM1004', name: 'Ananya Gupta', joiningDate: subDays(today, 55).toISOString().split('T')[0], grade: 'G9', currentSkill: 'Node.js', primarySkill: 'Node.js' },
  { vamid: 'VAM1005', name: 'Advik Reddy', joiningDate: subDays(today, 70).toISOString().split('T')[0], grade: 'G8', currentSkill: 'Python', primarySkill: 'Python' },
  { vamid: 'VAM1006', name: 'Ishaan Kumar', joiningDate: subDays(today, 85).toISOString().split('T')[0], grade: 'G7', currentSkill: 'AWS', primarySkill: 'Cloud' },
  { vamid: 'VAM1007', name: 'Myra Joshi', joiningDate: subDays(today, 100).toISOString().split('T')[0], grade: 'G9', currentSkill: 'Azure', primarySkill: 'Cloud' },
  { vamid: 'VAM1008', name: 'Sai Mishra', joiningDate: subDays(today, 5).toISOString().split('T')[0], grade: 'G6', currentSkill: 'Java', primarySkill: 'Java' },
  { vamid: 'VAM1009', name: 'Kiara Yadav', joiningDate: subDays(today, 32).toISOString().split('T')[0], grade: 'G7', currentSkill: 'React Native', primarySkill: 'Mobile' },
  { vamid: 'VAM1010', name: 'Reyansh Verma', joiningDate: subDays(today, 65).toISOString().split('T')[0], grade: 'G8', currentSkill: 'DevOps', primarySkill: 'DevOps' },
  { vamid: 'VAM1011', name: 'Zara Choudhary', joiningDate: subDays(today, 95).toISOString().split('T')[0], grade: 'G7', currentSkill: 'SQL', primarySkill: 'Database' },
  { vamid: 'VAM1012', name: 'Kabir Kumar', joiningDate: subDays(today, 12).toISOString().split('T')[0], grade: 'G6', currentSkill: 'JavaScript', primarySkill: 'JavaScript' },
  { vamid: 'VAM1013', name: 'Aadhya Singh', joiningDate: subDays(today, 48).toISOString().split('T')[0], grade: 'G8', currentSkill: 'C#', primarySkill: '.NET' },
  { vamid: 'VAM1014', name: 'Rohan Mehra', joiningDate: subDays(today, 78).toISOString().split('T')[0], grade: 'G7', currentSkill: 'Go', primarySkill: 'Backend' },
  { vamid: 'VAM1015', name: 'Saanvi Agarwal', joiningDate: subDays(today, 110).toISOString().split('T')[0], grade: 'G9', currentSkill: 'Machine Learning', primarySkill: 'AI/ML' },
  { vamid: 'VAM1016', name: 'Arjun Nair', joiningDate: subDays(today, 20).toISOString().split('T')[0], grade: 'G7', currentSkill: 'React', primarySkill: 'React' },
  { vamid: 'VAM1017', name: 'Priya Reddy', joiningDate: subDays(today, 50).toISOString().split('T')[0], grade: 'G8', currentSkill: 'Node.js', primarySkill: 'Node.js' },
  { vamid: 'VAM1018', name: 'Liam Patel', joiningDate: subDays(today, 80).toISOString().split('T')[0], grade: 'G7', currentSkill: 'Python', primarySkill: 'Python' },
  { vamid: 'VAM1019', name: 'Chloe Sharma', joiningDate: subDays(today, 28).toISOString().split('T')[0], grade: 'G6', currentSkill: 'Angular', primarySkill: 'Java' },
  { vAMID: 'VAM1020', name: 'Ethan Kumar', joiningDate: subDays(today, 92).toISOString().split('T')[0], grade: 'G8', currentSkill: 'AWS', primarySkill: 'Cloud' }
];

export const INITIAL_RESOURCES = ALL_RESOURCES.slice(0, 10);

export const APP_DATA_FIELDS = [
  "VAMID",
  "Name",
  "Joining Date",
  "Grade",
  "Primary Skill",
  "Current Skill",
  "Total Exp",
];

export const MOCK_EXCEL_COLUMNS = [
  'VAMID', 'Name', 'Joining Date', 'Grade', 'TSC', 'Account', 'Project', 'Allocation Status', 'Allocation Start Date', 'Allocation End Date', 'First Level Manager', 'Designation', 'Email', 'Sub dept', 'Relieving Date', 'Resigned on', 'Resignation Status', 'Second Level Manager', 'CurrentSkill', 'Primary Skill', 'VAM Exp', 'Total Exp', 'AccountSummary', 'Resourcing unit', 'Workspace'
];
