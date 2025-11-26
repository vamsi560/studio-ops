import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// TODO: Replace with your actual Google AI API key
const GOOGLE_GENAI_API_KEY = 'AIzaSyDStDizOgDU1VTMdY-Hk41HYZ-GEzbSsp4';

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_GENAI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
