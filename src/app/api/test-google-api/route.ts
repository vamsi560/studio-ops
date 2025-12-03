import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify Google AI API key validity
 * This makes a direct request to Google's API to check if the key works
 */
export async function GET() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim();
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'GOOGLE_GENAI_API_KEY environment variable is not set',
    }, { status: 400 });
  }

  // Clean the API key (remove any whitespace)
  const cleanApiKey = apiKey.replace(/\s+/g, '');
  
  try {
    // Make a test request to Google's API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello" if you can read this.'
            }]
          }]
        }),
      }
    );

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: responseData.error || responseData.message || 'Unknown error',
        apiKeyInfo: {
          length: cleanApiKey.length,
          startsWithAIza: cleanApiKey.startsWith('AIza'),
          hasWhitespace: apiKey !== cleanApiKey,
        },
        suggestion: response.status === 400 
          ? 'The API key appears to be invalid or malformed. Please verify it in Google AI Studio and ensure there are no extra spaces or characters.'
          : response.status === 403
          ? 'The API key may be invalid, revoked, or does not have the required permissions. Please check your Google AI Studio settings.'
          : response.status === 429
          ? 'API quota exceeded. Please check your Google Cloud Console for quota limits.'
          : 'Unknown error occurred. Check the error details above.',
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: '✅ API key is valid and working!',
      apiKeyInfo: {
        length: cleanApiKey.length,
        startsWithAIza: cleanApiKey.startsWith('AIza'),
        hasWhitespace: apiKey !== cleanApiKey,
      },
      response: responseData,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test API key',
      apiKeyInfo: {
        length: cleanApiKey.length,
        startsWithAIza: cleanApiKey.startsWith('AIza'),
        hasWhitespace: apiKey !== cleanApiKey,
      },
    }, { status: 500 });
  }
}

