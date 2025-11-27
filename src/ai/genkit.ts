import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Get API key from environment variable (set in Vercel) or fallback to hardcoded for local dev
const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyDStDizOgDU1VTMdY-Hk41HYZ-GEzbSsp4';

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_GENAI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
