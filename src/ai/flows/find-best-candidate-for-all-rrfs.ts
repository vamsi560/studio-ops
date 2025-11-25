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
  prompt: `You are an expert HR analyst. Your task is to analyze a list of RRFs (Resource Request Forms) and a Bench Report of available employees, provided in the input.

For EACH RRF in the provided list, you must identify the top 3-5 most suitable candidates from the Bench Report.

For each candidate matched to an RRF, provide:
1. The candidate's name and VAMID.
2. A suitability score from 0 to 100.
3. A brief justification for the match, highlighting key skills and experience.

Analyze the 'rrfsData' and 'benchData' from the input to perform this task.

Return ONLY a JSON array. Each item in the array should correspond to an RRF and contain the RRF ID and a list of the top candidates for that RRF.
Example:
[
  {
    "rrfId": "RRF-001",
    "candidates": [
      {
        "candidate": { "name": "Jane Doe", "vamid": "VAM12345" },
        "suitabilityScore": 95,
        "justification": "Expert in React and has 5 years of experience with cloud platforms."
      },
      {
        "candidate": { "name": "John Smith", "vamid": "VAM67890" },
        "suitabilityScore": 88,
        "justification": "Strong Java skills and has worked on similar projects."
      }
    ]
  },
  {
    "rrfId": "RRF-002",
    "candidates": [
      {
        "candidate": { "name": "Peter Jones", "vamid": "VAM11223" },
        "suitabilityScore": 92,
        "justification": "Specializes in DevOps and has the required certifications."
      }
    ]
  }
]`,
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
