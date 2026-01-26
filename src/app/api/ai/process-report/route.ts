import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({
        mock: true,
        data: {
          patientName: "John Doe (Demo)",
          age: "35",
          gender: "Male",
          symptoms: "Fever, cough, body ache",
          diagnosis: "Suspected Viral Fever"
        }
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    const prompt = `
      Extract the following information from this medical report image:
      1. Patient Name
      2. Age
      3. Gender
      4. Key symptoms mentioned
      5. Any diagnosis or clinical impression
      
      Return ONLY a JSON object with these keys: "patientName", "age", "gender", "symptoms", "diagnosis".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type
        }
      }
    ]);

    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

    return NextResponse.json({ data: JSON.parse(text) });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
