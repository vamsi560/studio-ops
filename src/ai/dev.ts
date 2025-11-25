import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-and-deduplicate-resources.ts';
import '@/ai/flows/smart-column-mapping.ts';
import '@/ai/flows/find-best-candidate.ts';
