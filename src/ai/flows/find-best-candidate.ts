'use server';
/**
 * @fileOverview A Genkit flow for finding the best candidate from a bench report for a given RRF.
 *
 * - findBestCandidate - A function that handles finding the best candidate.
 * - FindBestCandidateInput - The input type for the findBestCandidate function.
 * - FindBestCandidateOutput - The return type for the findBestcandidate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindBestCandidateInputSchema = z.object({
  rrfData: z
    .string()
    .describe('The RRF data as a JSON string.'),
  benchData: z
    .string()
    .describe('The Bench Report data as a JSON string.'),
});
export type FindBestCandidateInput = z.infer<typeof FindBestCandidateInputSchema>;

const FindBestCandidateOutputSchema = z.object({
  candidate: z.object({
    name: z.string().describe('The name of the best-matched candidate.'),
    vamid: z.string().describe('The VAMID of the best-matched candidate.'),
  }),
  suitabilityScore: z
    .number()
    .describe(
      'A score from 0 to 100 representing how suitable the candidate is.'
    ),
  justification: z
    .string()
    .describe('A brief justification for why this candidate is the best fit.'),
});
export type FindBestCandidateOutput = z.infer<typeof FindBestCandidateOutputSchema>;

export async function findBestCandidate(
  input: FindBestCandidateInput
): Promise<FindBestCandidateOutput> {
  return findBestCandidateFlow(input);
}

const findCandidatePrompt = ai.definePrompt({
  name: 'findCandidatePrompt',
  input: { schema: FindBestCandidateInputSchema },
  output: { schema: FindBestCandidateOutputSchema },
  prompt: `You are an expert HR analyst specializing in matching candidates to job requirements.
You are given data from two sources:
1. An RRF (Resource Request Form) describing the requirements for a role.
2. A Bench Report listing available employees and their skills.

Your task is to analyze both documents and identify the single best candidate from the Bench Report that matches the RRF requirements.

Provide a suitability score between 0 and 100 and a brief justification for your choice.

The RRF data is:
{{{rrfData}}}

The Bench Report data is:
{{{benchData}}}

Return ONLY a JSON object with the best candidate's details, their suitability score, and a justification.
Example:
{
  "candidate": {
    "name": "Jane Doe",
    "vamid": "VAM12345"
  },
  "suitabilityScore": 95,
  "justification": "Jane has 5 years of experience in React, which is the primary skill required. She also has experience with cloud platforms."
}`,
});

const findBestCandidateFlow = ai.defineFlow(
  {
    name: 'findBestCandidateFlow',
    inputSchema: FindBestCandidateInputSchema,
    outputSchema: FindBestCandidateOutputSchema,
  },
  async input => {
    const { output } = await findCandidatePrompt(input);
    return output!;
  }
);
