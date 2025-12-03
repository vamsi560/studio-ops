import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Get API key from environment variable (set in Vercel)
// Read at runtime when this module is first imported
const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY?.trim();

if (!GOOGLE_GENAI_API_KEY) {
  // Log diagnostic information
  const allEnvKeys = Object.keys(process.env);
  const relevantEnvVars = allEnvKeys
    .filter(k => 
      k.toUpperCase().includes('GOOGLE') || 
      k.toUpperCase().includes('GEMINI') || 
      k.toUpperCase().includes('API')
    )
    .slice(0, 20);
  
  console.error('[Genkit Config Error] ==========================================');
  console.error('[Genkit Config Error] Missing GOOGLE_GENAI_API_KEY environment variable');
  console.error('[Genkit Config Error] Total environment variables:', allEnvKeys.length);
  console.error('[Genkit Config Error] Relevant env vars:', relevantEnvVars.length > 0 ? relevantEnvVars.join(', ') : 'none');
  console.error('[Genkit Config Error] NODE_ENV:', process.env.NODE_ENV);
  console.error('[Genkit Config Error] ==========================================');
  
  throw new Error(
    '❌ GOOGLE_GENAI_API_KEY environment variable is required but not set.\n\n' +
    'Please check:\n' +
    '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n' +
    '2. Ensure GOOGLE_GENAI_API_KEY is set for Production/Preview/Development\n' +
    '3. Verify there are no typos or extra spaces\n' +
    '4. After adding/updating, trigger a NEW deployment (not just a redeploy)\n' +
    '5. Visit /api/test-api-key endpoint to verify the variable is accessible'
  );
}

// Log successful initialization (without exposing the key)
console.log('[Genkit Config] ✅ Initializing Genkit with Google AI plugin');
console.log('[Genkit Config] ✅ API key found (length:', GOOGLE_GENAI_API_KEY.length, 'characters)');

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_GENAI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
