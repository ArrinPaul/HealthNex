import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Validates the Gemini API key by making a minimal request.
 * Returns true if valid, false otherwise.
 */
export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return { valid: false, error: 'API key is missing or is the default placeholder.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Minimal request to verify key
    await model.generateContent("ping");
    
    return { valid: true };
  } catch (error: any) {
    console.error(' Gemini API Key Validation Failed:', error.message);
    return { 
      valid: false, 
      error: error.message || 'Unknown error occurred while validating API key.' 
    };
  }
}
