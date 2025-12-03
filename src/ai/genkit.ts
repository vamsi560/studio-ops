import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Get API key from environment variable (set in Vercel)
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    // Log helpful debugging information
    const envVars = Object.keys(process.env)
      .filter(k => k.toUpperCase().includes('GOOGLE') || k.toUpperCase().includes('GEMINI') || k.toUpperCase().includes('API'))
      .slice(0, 10); // Limit to first 10 matches
    
    console.error('[Genkit Config] Missing GOOGLE_GENAI_API_KEY environment variable');
    console.error('[Genkit Config] Relevant env vars found:', envVars.length > 0 ? envVars.join(', ') : 'none');
    
    throw new Error(
      'GOOGLE_GENAI_API_KEY environment variable is required but not set. ' +
      'Please set it in Vercel project settings → Environment Variables → Production/Preview/Development. ' +
      'After adding, trigger a new deployment for changes to take effect.'
    );
  }
  
  return apiKey.trim();
}

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [googleAI({ apiKey: getApiKey() })],
  model: 'googleai/gemini-2.5-flash',
});
