'use server';

/**
 * @fileOverview Automatically suggests column mappings from an uploaded Excel sheet to the application's data fields using AI.
 *
 * - suggestColumnMappings - A function that handles the suggestion of column mappings.
 * - SuggestColumnMappingsInput - The input type for the suggestColumnMappings function.
 * - SuggestColumnMappingsOutput - The return type for the suggestColumnMappings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestColumnMappingsInputSchema = z.object({
  excelColumns: z
    .array(z.string())
    .describe('The column names extracted from the uploaded Excel file.'),
  dataFields: z
    .array(z.string())
    .describe('The application data fields to map the Excel columns to.'),
});
export type SuggestColumnMappingsInput = z.infer<typeof SuggestColumnMappingsInputSchema>;

const SuggestColumnMappingsOutputSchema = z.record(z.string(), z.string()).describe(
  'A record of suggested column mappings, where keys are the application data fields and values are the corresponding Excel column names.'
);
export type SuggestColumnMappingsOutput = z.infer<typeof SuggestColumnMappingsOutputSchema>;

export async function suggestColumnMappings(
  input: SuggestColumnMappingsInput
): Promise<SuggestColumnMappingsOutput> {
  return suggestColumnMappingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColumnMappingsPrompt',
  input: {schema: SuggestColumnMappingsInputSchema},
  output: {schema: SuggestColumnMappingsOutputSchema},
  prompt: `You are an expert data analyst specializing in mapping Excel columns to application data fields.

You are provided with the column names from an uploaded Excel file and a list of application data fields.

Your task is to suggest the best mapping of Excel columns to the application data fields.

Consider the semantic meaning of both the Excel columns and the data fields to make accurate suggestions.

Excel Columns: {{excelColumns}}
Data Fields: {{dataFields}}

Suggest column mappings in JSON format, where keys are the application data fields and values are the corresponding Excel column names. If you can't find a mapping, return "null" as value.

Example:
{
  "VAMID": "VAMID",
  "Name": "Name",
  "Joining Date": "Joining Date",
  "Grade": "Grade",
  ...
}
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestColumnMappingsFlow = ai.defineFlow(
  {
    name: 'suggestColumnMappingsFlow',
    inputSchema: SuggestColumnMappingsInputSchema,
    outputSchema: SuggestColumnMappingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
