import { NextResponse } from 'next/server';

export async function GET() {
  // Check if API key is accessible (without exposing the actual key)
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  const isSet = !!apiKey && apiKey.trim() !== '';
  const length = apiKey?.length || 0;
  const prefix = apiKey?.substring(0, 10) || 'none';
  const suffix = apiKey?.substring(Math.max(0, length - 4)) || 'none';
  
  // Get all environment variables that might be relevant
  const relevantEnvVars = Object.keys(process.env)
    .filter(k => 
      k.toUpperCase().includes('GOOGLE') || 
      k.toUpperCase().includes('GEMINI') || 
      k.toUpperCase().includes('API')
    )
    .reduce((acc, key) => {
      const value = process.env[key];
      acc[key] = {
        exists: !!value,
        length: value?.length || 0,
        preview: value ? `${value.substring(0, 5)}...${value.substring(Math.max(0, value.length - 3))}` : 'empty'
      };
      return acc;
    }, {} as Record<string, { exists: boolean; length: number; preview: string }>);
  
  return NextResponse.json({
    apiKeyStatus: {
      isSet,
      length,
      preview: isSet ? `${prefix}...${suffix}` : 'not set',
      firstChars: prefix,
      lastChars: suffix
    },
    environment: process.env.NODE_ENV,
    relevantEnvVars,
    message: isSet 
      ? '✅ GOOGLE_GENAI_API_KEY is set. If errors persist, the key may be invalid.'
      : '❌ GOOGLE_GENAI_API_KEY is NOT set. Please add it in Vercel Environment Variables.'
  });
}
