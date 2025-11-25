'use server';
/**
 * @fileOverview A Genkit flow for finding the best candidates from a bench report for all given RRFs.
 *
 * - findBestCandidateForAllRRFs - A function that handles finding the best candidates for multiple RRFs.
 * - FindBestCandidateForAllRRFsInput - The input type for the function.
 * - FindBestCandidateForAllRRFsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input: RRFs and Bench data as structured objects
const FindBestCandidateForAllRRFsInputSchema = z.object({
  rrfsData: z.array(z.any()).describe('An array of RRF objects.'),
  benchData: z.array(z.any()).describe('An array of available bench resources.'),
});
export type FindBestCandidateForAllRRFsInput = z.infer<typeof FindBestCandidateForAllRRFsInputSchema>;

// Output: An array of results, one for each RRF
const RRFMatchSchema = z.object({
    rrfId: z.string().describe("The ID of the RRF (e.g., RRF number or a unique identifier from the data)."),
    candidates: z.array(z.object({
        candidate: z.object({
            name: z.string().describe("The name of the matched candidate."),
            vamid: z.string().describe("The VAMID of the matched candidate."),
        }),
        suitabilityScore: z.number().describe("A score from 0 to 100 representing how suitable the candidate is for this specific RRF."),
        justification: z.string().describe("A brief justification for why this candidate is a good fit for the RRF."),
    })).describe("A list of the top 3-5 candidates from the bench, sorted by suitability score in descending order.")
});

const FindBestCandidateForAllRRFsOutputSchema = z.array(RRFMatchSchema);
export type FindBestCandidateForAllRRFsOutput = z.infer<typeof FindBestCandidateForAllRRFsOutputSchema>;


export async function findBestCandidateForAllRRFs(
  input: FindBestCandidateForAllRRFsInput
): Promise<FindBestCandidateForAllRRFsOutput> {
  return findBestCandidateForAllRRFsFlow(input);
}

const findCandidatesPrompt = ai.definePrompt({
  name: 'findCandidatesPrompt',
  input: { schema: FindBestCandidateForAllRRFsInputSchema },
  output: { schema: FindBestCandidateForAllRRFsOutputSchema },
  prompt: `You are an expert HR analyst acting as a data processing service. Your task is to analyze the provided JSON data for RRFs and Bench Resources and return a JSON output matching the specified schema.

You are given two JSON arrays: 'rrfsData' and 'benchData'.

For EACH RRF object in the 'rrfsData' array, you MUST identify the top 3-5 most suitable candidates from the 'benchData' array.

IMPORTANT: When analyzing, use ONLY the following keys from the JSON objects:
- From the RRF objects in 'rrfsData': Use 'RRF ID', 'POS Title', and 'Role'.
- From the Bench objects in 'benchData': Use 'Name', 'VAMID', and 'Skill'. Match the 'Skill' from the bench data with the requirements in 'POS Title' and 'Role' from the RRF data.

For each RRF, generate a list of candidates. For each candidate, provide:
1. The candidate's name and VAMID, taken directly from the 'benchData'.
2. A suitability score from 0 to 100 based on the skill match.
3. A brief justification for the match.

The data to analyze is as follows:
RRF Data:
{{{json rrfsData}}}

Bench Data:
{{{json benchData}}}

Return ONLY a valid JSON array that adheres to the output schema. Each item in the array must correspond to an RRF and contain the RRF ID and a list of the top candidates for that RRF, sorted by suitability score in descending order. Do not include any explanatory text or markdown formatting in your response.
`,
});

const findBestCandidateForAllRRFsFlow = ai.defineFlow(
  {
    name: 'findBestCandidateForAllRRFsFlow',
    inputSchema: FindBestCandidateForAllRRFsInputSchema,
    outputSchema: FindBestCandidateForAllRRFsOutputSchema,
  },
  async input => {
    const { output } = await findCandidatesPrompt(input);
    return output!;
  }
);
