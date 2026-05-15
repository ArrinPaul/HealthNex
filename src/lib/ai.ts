import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GOOGLE_AI_API_KEY;

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    throw new Error("AI Service Not Configured. Please configure GOOGLE_AI_API_KEY.");
  }
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateJSONResponse(model: any, prompt: string) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text().trim();
  
  if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim();
  if (text.startsWith('```')) text = text.replace(/```/g, '').trim();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', text);
    throw new Error('Invalid AI response format');
  }
}
