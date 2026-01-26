import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatbotMessageSchema } from '@/lib/validations';

// Process health messages using AI or predefined responses
async function processHealthMessage(message: string, language: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific health topics
  if (lowerMessage.includes('water') || lowerMessage.includes('purif') || lowerMessage.includes('drink')) {
    return multiLanguageResponses[language as keyof typeof multiLanguageResponses]?.waterSafety || multiLanguageResponses.en.waterSafety;
  }
  
  if (lowerMessage.includes('hand') || lowerMessage.includes('wash') || lowerMessage.includes('hygiene')) {
    return multiLanguageResponses[language as keyof typeof multiLanguageResponses]?.handHygiene || multiLanguageResponses.en.handHygiene;
  }
  
  if (lowerMessage.includes('symptom') || lowerMessage.includes('fever') || lowerMessage.includes('sick')) {
    return multiLanguageResponses[language as keyof typeof multiLanguageResponses]?.symptoms || multiLanguageResponses.en.symptoms;
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
    return multiLanguageResponses[language as keyof typeof multiLanguageResponses]?.emergency || multiLanguageResponses.en.emergency;
  }
  
  // Use Gemini API if configured
  const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      const aiResponse = await generateAIHealthResponse(message, language, geminiApiKey);
      if (aiResponse && !aiResponse.includes('I apologize, but I cannot process')) {
        return aiResponse;
      }
    } catch (error) {
      console.error('Gemini AI error:', error);
      // Continue to fallback response
    }
  }
  
  // Default welcome message
  return multiLanguageResponses[language as keyof typeof multiLanguageResponses]?.welcome || multiLanguageResponses.en.welcome;
}

async function generateAIHealthResponse(message: string, language: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a healthcare assistant. Respond in ${language} language. User asks: "${message}". Provide helpful, accurate health information focusing on water safety, hygiene, disease prevention, and general health guidance. Keep responses concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || 'I apologize, but I cannot process your request at the moment. Please try asking about water safety, hygiene, or general health topics.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'I apologize, but I cannot process your request at the moment. Please try asking about water safety, hygiene, or general health topics.';
  }
}


// Multi-language responses
const multiLanguageResponses = {
  en: {
    welcome: "🤖 **Health Assistant Available**\n\nI'm here to help with:\n• Water safety and purification\n• Disease prevention and symptoms\n• Hygiene practices\n• Emergency health guidance\n• Community health information\n\nAsk me anything about health and safety!",
    waterSafety: "💧 **Water Safety Guidelines:**\n\n• Always boil water for 5-10 minutes\n• Use water purification tablets\n• Store water in clean containers\n• Avoid stagnant water sources\n• Regular water quality testing\n\nClean water prevents waterborne diseases like cholera and diarrhea.",
    handHygiene: "🧼 **Hand Hygiene Steps:**\n\n1. Wet hands with clean water\n2. Apply soap and lather well\n3. Scrub for at least 20 seconds\n4. Rinse thoroughly\n5. Dry with clean towel\n\nWash hands before eating, after using toilet, and when caring for sick.",
    symptoms: "🩺 **Common Health Symptoms:**\n\n⚠️ **Seek immediate help for:**\n• High fever (>101°F)\n• Difficulty breathing\n• Severe headache\n• Persistent vomiting\n• Blood in stool/urine\n\nContact health center: 104 | Emergency: 108",
    emergency: "🚨 **Emergency Contacts:**\n\n• Health Helpline: 104\n• Emergency Services: 108\n• Ambulance: 102\n• Poison Control: 1066\n\nFor immediate medical emergency, call 108 or visit nearest hospital."
  },
  hi: {
    welcome: "🤖 **स्वास्थ्य सहायक उपलब्ध**\n\nमैं यहाँ मदद के लिए हूँ:\n• पानी की सुरक्षा और शुद्धीकरण\n• रोग की रोकथाम और लक्षण\n• स्वच्छता प्रथाएं\n• आपातकालीन स्वास्थ्य मार्गदर्शन\n• सामुदायिक स्वास्थ्य जानकारी\n\nस्वास्थ्य और सुरक्षा के बारे में कुछ भी पूछें!",
    waterSafety: "💧 **पानी सुरक्षा दिशानिर्देश:**\n\n• पानी को हमेशा 5-10 मिनट तक उबालें\n• पानी शुद्धीकरण गोलियों का उपयोग करें\n• पानी को साफ बर्तनों में रखें\n• स्थिर पानी के स्रोतों से बचें\n• नियमित पानी की गुणवत्ता की जांच\n\nसाफ पानी हैजा और दस्त जैसी जल जनित बीमारियों को रोकता है।",
    handHygiene: "🧼 **हाथ स्वच्छता के चरण:**\n\n1. साफ पानी से हाथ गीले करें\n2. साबुन लगाएं और अच्छी तरह झाग बनाएं\n3. कम से कम 20 सेकंड तक रगड़ें\n4. अच्छी तरह से धोएं\n5. साफ तौलिए से सुखाएं\n\nखाने से पहले, शौचालय के बाद और बीमार की देखभाल करते समय हाथ धोएं।",
    symptoms: "🩺 **सामान्य स्वास्थ्य लक्षण:**\n\n⚠️ **तुरंत मदद लें:**\n• तेज बुखार (>101°F)\n• सांस लेने में कठिनाई\n• गंभीर सिरदर्द\n• लगातार उल्टी\n• मल/मूत्र में खून\n\nस्वास्थ्य केंद्र संपर्क: 104 | आपातकाल: 108",
    emergency: "🚨 **आपातकालीन संपर्क:**\n\n• स्वास्थ्य हेल्पलाइन: 104\n• आपातकालीन सेवाएं: 108\n• एम्बुलेंस: 102\n• जहर नियंत्रण: 1066\n\nतत्काल चिकित्सा आपातकाल के लिए, 108 पर कॉल करें या निकटतम अस्पताल जाएं।"
  },
  bn: {
    welcome: "🤖 **স্বাস্থ্য সহায়ক উপলব্ধ**\n\nআমি এখানে সাহায্য করতে এসেছি:\n• পানির নিরাপত্তা এবং পরিশোধন\n• রোগ প্রতিরোধ এবং উপসর্গ\n• স্বাস্থ্যবিধি অনুশীলন\n• জরুরি স্বাস্থ্য নির্দেশনা\n• কমিউনিটি স্বাস্থ্য তথ্য\n\nস্বাস্থ্য এবং নিরাপত্তা সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন!",
    waterSafety: "💧 **পানির নিরাপত্তা নির্দেশিকা:**\n\n• সর্বদা পানি ৫-১০ মিনিট ফুটান\n• পানি পরিশোধন ট্যাবলেট ব্যবহার করুন\n• পানি পরিষ্কার পাত্রে সংরক্ষণ করুন\n• স্থির পানির উৎস এড়িয়ে চলুন\n• নিয়মিত পানির মান পরীক্ষা\n\nপরিষ্কার পানি কলেরা এবং ডায়রিয়ার মতো পানিবাহিত রোগ প্রতিরোধ করে।",
    handHygiene: "🧼 **হাত স্বাস্থ্যবিধি ধাপ:**\n\n১. পরিষ্কার পানি দিয়ে হাত ভিজান\n২. সাবান লাগান এবং ভালো করে ফেনা তুলুন\n৩. কমপক্ষে ২০ সেকেন্ড ঘষুন\n৪. ভালোভাবে ধুয়ে ফেলুন\n৫. পরিষ্কার তোয়ালে দিয়ে শুকান\n\nখাওয়ার আগে, টয়লেট ব্যবহারের পর এবং অসুস্থের যত্ন নেওয়ার সময় হাত ধুয়ে নিন।",
    symptoms: "🩺 **সাধারণ স্বাস্থ্য উপসর্গ:**\n\n⚠️ **তৎক্ষণাৎ সাহায্য নিন:**\n• উচ্চ জ্বর (>১০১°ফা)\n• শ্বাসকষ্ট\n• তীব্র মাথাব্যথা\n• ক্রমাগত বমি\n• মল/প্রস্রাবে রক্ত\n\nস্বাস্থ্য কেন্দ্র যোগাযোগ: ১০৪ | জরুরি: ১০৮",
    emergency: "🚨 **জরুরি যোগাযোগ:**\n\n• স্বাস্থ্য হেল্পলাইন: ১০৪\n• জরুরি সেবা: ১০৮\n• অ্যাম্বুলেন্স: ১০২\n• বিষ নিয়ন্ত্রণ: ১০৬৬\n\nতাৎক্ষণিক চিকিৎসা জরুরি অবস্থার জন্য ১০৮ নম্বরে কল করুন বা নিকটতম হাসপাতালে যান।"
  },
  es: {
    welcome: "🤖 **Asistente de Salud Disponible**\n\nEstoy aquí para ayudar con:\n• Seguridad y purificación del agua\n• Prevención de enfermedades y síntomas\n• Prácticas de higiene\n• Orientación de salud de emergencia\n• Información de salud comunitaria\n\n¡Pregúntame cualquier cosa sobre salud y seguridad!",
    waterSafety: "💧 **Pautas de Seguridad del Agua:**\n\n• Hierve siempre el agua durante 5-10 minutos\n• Usa tabletas de purificación de agua\n• Almacena agua en recipientes limpios\n• Evita fuentes de agua estancada\n• Pruebas regulares de calidad del agua\n\nEl agua limpia previene enfermedades transmitidas por el agua como cólera y diarrea.",
    handHygiene: "🧼 **Pasos de Higiene de Manos:**\n\n1. Moja las manos con agua limpia\n2. Aplica jabón y haz espuma\n3. Frota durante al menos 20 segundos\n4. Enjuaga completamente\n5. Seca con toalla limpia\n\nLávate las manos antes de comer, después de usar el baño y al cuidar enfermos.",
    symptoms: "🩺 **Síntomas de Salud Comunes:**\n\n⚠️ **Busca ayuda inmediata para:**\n• Fiebre alta (>38.3°C)\n• Dificultad para respirar\n• Dolor de cabeza severo\n• Vómito persistente\n• Sangre en heces/orina\n\nContacta centro de salud: 104 | Emergencia: 108",
    emergency: "🚨 **Contactos de Emergencia:**\n\n• Línea de Salud: 104\n• Servicios de Emergencia: 108\n• Ambulancia: 102\n• Control de Venenos: 1066\n\nPara emergencia médica inmediata, llama al 108 o visita el hospital más cercano."
  },
  fr: {
    welcome: "🤖 **Assistant Santé Disponible**\n\nJe suis là pour aider avec:\n• Sécurité et purification de l'eau\n• Prévention des maladies et symptômes\n• Pratiques d'hygiène\n• Conseils de santé d'urgence\n• Informations de santé communautaire\n\nDemandez-moi n'importe quoi sur la santé et la sécurité!",
    waterSafety: "💧 **Directives de Sécurité de l'Eau:**\n\n• Faites toujours bouillir l'eau 5-10 minutes\n• Utilisez des comprimés de purification\n• Stockez l'eau dans des récipients propres\n• Évitez les sources d'eau stagnante\n• Tests réguliers de qualité de l'eau\n\nL'eau propre prévient les maladies hydriques comme le choléra et la diarrhée.",
    handHygiene: "🧼 **Étapes d'Hygiène des Mains:**\n\n1. Mouillez les mains avec de l'eau propre\n2. Appliquez du savon et faites mousser\n3. Frottez pendant au moins 20 secondes\n4. Rincez soigneusement\n5. Séchez avec une serviette propre\n\nLavez-vous les mains avant de manger, après les toilettes et en soignant les malades.",
    symptoms: "🩺 **Symptômes de Santé Courants:**\n\n⚠️ **Cherchez de l'aide immédiate pour:**\n• Fièvre élevée (>38.3°C)\n• Difficulté à respirer\n• Mal de tête sévère\n• Vomissement persistant\n• Sang dans selles/urine\n\nContactez centre de santé: 104 | Urgence: 108",
    emergency: "🚨 **Contacts d'Urgence:**\n\n• Ligne Santé: 104\n• Services d'Urgence: 108\n• Ambulance: 102\n• Contrôle des Poisons: 1066\n\nPour urgence médicale immédiate, appelez le 108 ou visitez l'hôpital le plus proche."
  }
};

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = ChatbotMessageSchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { message, language } = result.data;
    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;

    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      const fallback = await processHealthMessage(message, language);
      return NextResponse.json({ response: fallback });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a healthcare assistant. Respond in ${language} language. User asks: "${message}". Provide helpful, accurate health information focusing on water safety, hygiene, disease prevention, and general health guidance. Keep responses concise and actionable.`;

    const resultStream = await model.generateContentStream(prompt);
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
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

function generateSuggestions(language: string): string[] {
  const suggestions = {
    en: [
      'Contact health helpline: 104',
      'Call emergency: 108',
      'Visit health center'
    ],
    hi: [
      'स्वास्थ्य हेल्पलाइन: 104',
      'आपातकाल कॉल: 108',
      'स्वास्थ्य केंद्र जाएं'
    ],
    bn: [
      'স্বাস্থ্য হেল্পলাইন: ১০৪',
      'জরুরি কল: ১০৮',
      'স্বাস্থ্য কেন্দ্র যান'
    ],
    es: [
      'Línea de salud: 104',
      'Emergencia: 108',
      'Visita centro de salud'
    ],
    fr: [
      'Ligne santé: 104',
      'Urgence: 108',
      'Visitez centre de santé'
    ]
  };
  
  return suggestions[language as keyof typeof suggestions] || suggestions.en;
}

function generateFallbackResponse(message: string, language: string = 'en'): string {
  const responses = multiLanguageResponses[language as keyof typeof multiLanguageResponses] || multiLanguageResponses.en;
  
  // Return welcome message if no message provided
  if (!message) {
    return responses.welcome;
  }
  
  const lowercaseMessage = message.toLowerCase();
  
  // Analyze message for specific health topics
  if (lowercaseMessage.includes('water') || lowercaseMessage.includes('पानी') || lowercaseMessage.includes('পানি')) {
    return responses.waterSafety;
  }
  
  if (lowercaseMessage.includes('hand') || lowercaseMessage.includes('hygiene') || 
      lowercaseMessage.includes('हाथ') || lowercaseMessage.includes('स्वच्छता') ||
      lowercaseMessage.includes('হাত') || lowercaseMessage.includes('স্বাস্থ্যবিধি')) {
    return responses.handHygiene;
  }
  
  if (lowercaseMessage.includes('symptom') || lowercaseMessage.includes('sick') ||
      lowercaseMessage.includes('लक्षण') || lowercaseMessage.includes('बीमार') ||
      lowercaseMessage.includes('উপসর্গ') || lowercaseMessage.includes('অসুস্থ')) {
    return responses.symptoms;
  }
  
  if (lowercaseMessage.includes('emergency') || lowercaseMessage.includes('help') ||
      lowercaseMessage.includes('आपातकाल') || lowercaseMessage.includes('मदद') ||
      lowercaseMessage.includes('জরুরি') || lowercaseMessage.includes('সাহায্য')) {
    return responses.emergency;
  }

  // Return appropriate response based on message content and language
  return responses.welcome;
}