const API_BASE_URL = '/api';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  category?: string;
}

export interface ChatbotResponse {
  response: string;
  category: string;
  confidence: number;
  suggestions: string[];
}

export interface AISuggestion {
  id: string;
  type: 'health' | 'water' | 'emergency' | 'trend' | 'personal';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  timestamp: Date;
  location?: string;
  category: string;
  aiGenerated?: boolean;
  confidence?: number;
}

class ChatbotService {
  async sendMessage(message: string, context?: any): Promise<ChatbotResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Fallback response
      return {
        response: this.generateFallbackResponse(message),
        category: 'fallback',
        confidence: 0.6,
        suggestions: [
          'Contact health helpline: 104',
          'Call emergency: 108',
          'Visit health center'
        ]
      };
    }
  }

  async getSuggestions(category?: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/suggestions${category ? `?category=${encodeURIComponent(category)}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestions API error:', error);
      return [
        'How to purify water safely?',
        'Symptoms of waterborne diseases',
        'Proper hand washing steps',
        'Emergency health contacts'
      ];
    }
  }

  private generateFallbackResponse(message: string): string {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('water')) {
      return `🚰 **Water Safety Guidelines:**

• Boil water for at least 20 minutes
• Store in clean, covered containers
• Check color, smell, and taste
• Use purification tablets if needed

For specific concerns, contact your local health department.`;
    }

    if (lowercaseMessage.includes('health') || lowercaseMessage.includes('symptom')) {
      return `🏥 **Health Information:**

For health concerns:
• Seek medical attention for serious symptoms
• Call health helpline: 104
• Call ambulance: 108
• Visit nearest health center

Always consult healthcare professionals for medical advice.`;
    }

    return `🤖 **Health Assistant:**

I can help with:
• Water safety and purification
• Disease prevention
• Hygiene practices  
• Emergency contacts
• Health surveillance information

Please ask specific questions about health, water safety, or hygiene.

**Emergency contacts:**
• Ambulance: 108
• Health Helpline: 104`;
  }
}

class SuggestionsService {
  async generatePersonalizedSuggestions(userData: {
    userId?: string;
    location?: any;
    preferences?: any;
    healthData?: any;
  }): Promise<AISuggestion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('AI Suggestions error:', error);
      return this.getFallbackSuggestions();
    }
  }

  async getHealthTrends(area: string = 'general', timeframe: string = 'weekly'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions/health-trends?area=${area}&timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health trends error:', error);
      return null;
    }
  }

  async performRiskAssessment(factors: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ factors }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Risk assessment error:', error);
      return null;
    }
  }

  async getContextualSuggestions(context: {
    time?: string;
    weather?: string;
    season?: string;
  }): Promise<AISuggestion[]> {
    try {
      const params = new URLSearchParams(context as any).toString();
      const response = await fetch(`${API_BASE_URL}/suggestions/contextual?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Contextual suggestions error:', error);
      return [];
    }
  }

  private getFallbackSuggestions(): AISuggestion[] {
    return [
      {
        id: 'fallback-1',
        type: 'water',
        priority: 'medium',
        title: 'Daily Water Safety Check',
        description: 'Ensure your drinking water is properly purified and stored safely.',
        action: 'Learn More',
        actionUrl: '/education',
        timestamp: new Date(),
        category: 'water_safety'
      },
      {
        id: 'fallback-2',
        type: 'health',
        priority: 'low',
        title: 'Health Monitoring Reminder',
        description: 'Regular health checks help in early detection of potential issues.',
        action: 'View Guide',
        actionUrl: '/health-data',
        timestamp: new Date(),
        category: 'preventive_care'
      }
    ];
  }
}

// Export service instances
export const chatbotService = new ChatbotService();
export const suggestionsService = new SuggestionsService();

// Utility functions
export const formatChatMessage = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/• (.*?)(\n|$)/g, '• $1<br/>')
    .replace(/(\d+\. )(.*?)(\n|$)/g, '$1$2<br/>')
    .split('\n').join('<br/>');
};

export const categorizeChatMessage = (message: string): string => {
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes('water') || lowercaseMessage.includes('drink') || lowercaseMessage.includes('purify')) {
    return 'water';
  }
  if (lowercaseMessage.includes('symptom') || lowercaseMessage.includes('fever') || lowercaseMessage.includes('sick')) {
    return 'health';
  }
  if (lowercaseMessage.includes('wash') || lowercaseMessage.includes('clean') || lowercaseMessage.includes('hygiene')) {
    return 'hygiene';
  }
  if (lowercaseMessage.includes('emergency') || lowercaseMessage.includes('urgent') || lowercaseMessage.includes('help')) {
    return 'emergency';
  }
  
  return 'general';
};