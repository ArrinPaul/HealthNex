import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

async function checkAIStatus() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return 'not_configured';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Minimal token count check to verify key validity without generating content
    await model.countTokens("Ping"); 
    return 'operational';
  } catch (error) {
    console.error('AI Health Check Error:', error);
    return 'error';
  }
}

export async function GET() {
  try {
    const aiStatus = await checkAIStatus();

    return NextResponse.json({
      status: aiStatus === 'error' ? 'DEGRADED' : 'OK',
      timestamp: new Date().toISOString(),
      services: {
        chatbot: 'operational',
        suggestions: 'operational',
        healthData: 'operational',
        ai: aiStatus
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}