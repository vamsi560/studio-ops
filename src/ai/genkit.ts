import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Get API key from environment variable (set in Vercel)
const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;

if (!GOOGLE_GENAI_API_KEY) {
  throw new Error('GOOGLE_GENAI_API_KEY environment variable is required. Please set it in Vercel environment variables.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_GENAI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
