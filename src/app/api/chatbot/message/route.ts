import { NextRequest, NextResponse } from 'next/server';
import { ChatbotMessageSchema } from '@/lib/validations';

export const runtime = 'edge';

const multiLanguageResponses = {
  en: {
    welcome:
      "Health Assistant Available. I can help with water safety, disease prevention, hygiene practices, emergency guidance, and community health information.",
    waterSafety:
      'Water safety: boil water for 5-10 minutes, use purification tablets, store in clean containers, avoid stagnant sources, and test quality regularly.',
    handHygiene:
      'Hand hygiene: wet hands, apply soap, scrub for at least 20 seconds, rinse, and dry with a clean towel.',
    symptoms:
      'Seek immediate help for high fever, breathing difficulty, severe headache, persistent vomiting, or blood in stool/urine. Health helpline: 104, emergency: 108.',
    emergency:
      'Emergency contacts: health helpline 104, emergency services 108, ambulance 102, poison control 1066.',
  },
  hi: {
    welcome:
      'Swasthya sahayak upalabdh hai. Main paani suraksha, rog roktham, swachhta, aur emergency margdarshan mein madad kar sakta hoon.',
    waterSafety:
      'Paani suraksha: paani 5-10 minute ubaalein, purification tablets ka upyog karein, saaf bartano mein rakhein, aur thehre hue paani se bachen.',
    handHygiene:
      'Haath swachhta: haath geele karein, sabun lagayein, 20 second tak ghisen, dhoyein, aur saaf towel se sukhaayein.',
    symptoms:
      'Tez bukhar, saans ki dikkat, tez sir dard, lagatar ulti, ya stool/urine mein khoon ho to turant madad lein. Helpline: 104, emergency: 108.',
    emergency:
      'Emergency contacts: health helpline 104, emergency 108, ambulance 102, poison control 1066.',
  },
  bn: {
    welcome:
      'Swasthyo sohayok upolobdho. Ami pani nirapotta, rog protirodh, swasthobidhi, ebong joruri sohayotay sahajjo korte pari.',
    waterSafety:
      'Panir nirapotta: pani 5-10 minute futan, purification tablet byabohar korun, porishkar patre songrokkhon korun, ebong sthir pani theke dure thakun.',
    handHygiene:
      'Hater swasthobidhi: hat bhijun, saban din, kompakhe 20 second ghushun, bhalo kore dhue porishkar toyal e muchhun.',
    symptoms:
      'Uccho jor, shashkosto, tibro mathabatha, obiroto bomi, ba stool/urine-e rokto hole tatkhonik sohayota nin. Helpline: 104, emergency: 108.',
    emergency:
      'Joruri jogajog: health helpline 104, emergency 108, ambulance 102, poison control 1066.',
  },
} as const;

type SupportedLanguage = keyof typeof multiLanguageResponses;

function normalizeLanguage(language: string): SupportedLanguage {
  return language in multiLanguageResponses
    ? (language as SupportedLanguage)
    : 'en';
}

function generateFallbackResponse(message: string, language: string): string {
  const lang = normalizeLanguage(language);
  const responses = multiLanguageResponses[lang];
  const text = (message || '').toLowerCase();

  if (!text) return responses.welcome;
  if (text.includes('water') || text.includes('pani')) return responses.waterSafety;
  if (text.includes('hand') || text.includes('hygiene')) return responses.handHygiene;
  if (text.includes('symptom') || text.includes('sick') || text.includes('fever')) return responses.symptoms;
  if (text.includes('emergency') || text.includes('help')) return responses.emergency;

  return responses.welcome;
}

async function trackChatbotUsage(_request: NextRequest): Promise<void> {
  try {
    const { ConvexHttpClient } = await import('convex/browser');
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl || (!convexUrl.startsWith('http://') && !convexUrl.startsWith('https://'))) return;

    const token = _request.cookies.get('auth-token')?.value;
    if (!token) return;

    const convex = new ConvexHttpClient(convexUrl);
    const { api } = await import('../../../../../convex/_generated/api');
    await (convex.mutation as any)(api.usage.trackUsage, {
      token,
      feature: 'chatbot',
      status: 'success',
    });
  } catch {
    // Usage tracking is non-critical
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = ChatbotMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { message, language } = parsed.data;
    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;

    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ response: generateFallbackResponse(message, language) });
    }

    let resultStream;
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt =
        `You are a healthcare assistant. Respond in ${language} language. ` +
        `User asks: "${message}". Provide concise, accurate guidance on water safety, hygiene, ` +
        'disease prevention, and general health advice.';

      resultStream = await model.generateContentStream(prompt);
    } catch (aiError) {
      console.error('Gemini API failed, using fallback:', aiError);
      return NextResponse.json({ response: generateFallbackResponse(message, language) });
    }

    await trackChatbotUsage(request);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of resultStream.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }
          controller.close();
        } catch (error) {
          console.error('Stream error, sending fallback:', error);
          controller.enqueue(encoder.encode(generateFallbackResponse(message, language)));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
