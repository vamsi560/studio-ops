'use server';
/**
 * @fileOverview A Genkit flow for summarizing the results of resource matching.
 *
 * - summarizeResourceMatches - A function that generates a summary for the matching results.
 * - SummarizeResourceMatchesInput - The input type for the function.
 * - SummarizeResourceMatchesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeResourceMatchesInputSchema = z.object({
  results: z.array(z.any()).describe("The JSON results from the findBestCandidateForAllRRFs flow."),
});
export type SummarizeResourceMatchesInput = z.infer<typeof SummarizeResourceMatchesInputSchema>;

const SummarizeResourceMatchesOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the matching results, highlighting key findings and potential actions."),
});
export type SummarizeResourceMatchesOutput = z.infer<typeof SummarizeResourceMatchesOutputSchema>;

export async function summarizeResourceMatches(
  input: SummarizeResourceMatchesInput
): Promise<SummarizeResourceMatchesOutput> {
  return summarizeResourceMatchesFlow(input);
}

const summarizeMatchesPrompt = ai.definePrompt({
  name: 'summarizeMatchesPrompt',
  input: { schema: SummarizeResourceMatchesInputSchema },
  output: { schema: SummarizeResourceMatchesOutputSchema },
  prompt: `You are an expert HR analyst. You have been provided with the results of a matching process between RRFs and available bench resources.

Your task is to provide a brief, insightful summary of these results.

The matching results are:
{{{json results}}}

Please provide a summary that includes:
- The total number of RRFs analyzed.
- The number of RRFs with at least one "Excellent" candidate (suitability score > 90).
- Any RRFs that have no suitable candidates.
- A concluding sentence on the overall state of the bench relative to the open requests.

Return ONLY a JSON object with a "summary" field.
`,
});

const summarizeResourceMatchesFlow = ai.defineFlow(
  {
    name: 'summarizeResourceMatchesFlow',
    inputSchema: SummarizeResourceMatchesInputSchema,
    outputSchema: SummarizeResourceMatchesOutputSchema,
  },
  async input => {
    const { output } = await summarizeMatchesPrompt(input);
    return output!;
  }
);
