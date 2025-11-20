'use server';
/**
 * @fileOverview This file contains a Genkit flow for analyzing and deduplicating resources from an uploaded Excel sheet.
 *
 * - analyzeAndDeduplicateResources - A function that handles the analysis and deduplication of resources.
 * - AnalyzeAndDeduplicateResourcesInput - The input type for the analyzeAndDeduplicateResources function.
 * - AnalyzeAndDeduplicateResourcesOutput - The return type for the analyzeAndDeduplicateResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndDeduplicateResourcesInputSchema = z.object({
  excelDataUri: z
    .string()
    .describe(
      "The Excel file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  previousResourceIds: z
    .array(z.string())
    .describe('An array of VAMIDs representing previously uploaded resources.'),
});
export type AnalyzeAndDeduplicateResourcesInput = z.infer<typeof AnalyzeAndDeduplicateResourcesInputSchema>;

const AnalyzeAndDeduplicateResourcesOutputSchema = z.object({
  newResourceIds: z
    .array(z.string())
    .describe('An array of VAMIDs representing newly identified resources.'),
});
export type AnalyzeAndDeduplicateResourcesOutput = z.infer<typeof AnalyzeAndDeduplicateResourcesOutputSchema>;

export async function analyzeAndDeduplicateResources(
  input: AnalyzeAndDeduplicateResourcesInput
): Promise<AnalyzeAndDeduplicateResourcesOutput> {
  return analyzeAndDeduplicateResourcesFlow(input);
}

const analyzeResourcesPrompt = ai.definePrompt({
  name: 'analyzeResourcesPrompt',
  input: {
    schema: AnalyzeAndDeduplicateResourcesInputSchema,
  },
  output: {
    schema: AnalyzeAndDeduplicateResourcesOutputSchema,
  },
  prompt: `You are an expert in resource management and data analysis. You are provided with data from a newly uploaded Excel sheet and a list of VAMIDs representing previously uploaded resources.

  Your task is to analyze the new Excel data, identify resources that are not present in the list of previous resources, and return a list of VAMIDs for these new resources.

  Consider potential slight discrepancies in resource names when comparing against previous records. Use your best judgment to determine if a resource is truly new or simply a variation of an existing record.

  Here's the new Excel data (represented as a data URI): {{media url=excelDataUri}}
  Here's the list of previous resource IDs (VAMIDs): {{{previousResourceIds}}}

  Return ONLY a JSON object containing a \"newResourceIds\" key with an array of VAMIDs for the newly identified resources.
  {
    \"newResourceIds\": [\"VAMID123\", \"VAMID456\", ...]
  }`,
});

const analyzeAndDeduplicateResourcesFlow = ai.defineFlow(
  {
    name: 'analyzeAndDeduplicateResourcesFlow',
    inputSchema: AnalyzeAndDeduplicateResourcesInputSchema,
    outputSchema: AnalyzeAndDeduplicateResourcesOutputSchema,
  },
  async input => {
    const {output} = await analyzeResourcesPrompt(input);
    return output!;
  }
);
