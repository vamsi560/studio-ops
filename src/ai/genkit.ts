import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Get API key from environment variable (set in Vercel)
// Read at runtime when this module is first imported
function getAndValidateApiKey(): string {
  const rawApiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!rawApiKey) {
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

  // Clean and validate the API key
  const apiKey = rawApiKey.trim().replace(/\s+/g, '');
  
  // Validate API key format (should start with AIza and be ~39 characters)
  if (apiKey.length < 35 || apiKey.length > 45) {
    console.warn('[Genkit Config] ⚠️ API key length is unusual:', apiKey.length, 'characters (expected ~39)');
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.warn('[Genkit Config] ⚠️ API key does not start with "AIza" - may be invalid');
  }
  
  // Check for common issues
  if (rawApiKey !== apiKey) {
    console.warn('[Genkit Config] ⚠️ API key had whitespace that was removed. Original length:', rawApiKey.length, '→ Cleaned:', apiKey.length);
  }
  
  if (apiKey.includes('\n') || apiKey.includes('\r')) {
    console.warn('[Genkit Config] ⚠️ API key contains newline characters - this may cause issues');
  }
  
  return apiKey;
}

const GOOGLE_GENAI_API_KEY = getAndValidateApiKey();

// Log successful initialization (without exposing the key)
console.log('[Genkit Config] ✅ Initializing Genkit with Google AI plugin');
console.log('[Genkit Config] ✅ API key found (length:', GOOGLE_GENAI_API_KEY.length, 'characters)');
console.log('[Genkit Config] ✅ API key format:', GOOGLE_GENAI_API_KEY.startsWith('AIza') ? 'Valid format' : '⚠️ Unexpected format');

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: GOOGLE_GENAI_API_KEY,
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
