"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles,
  Heart,
  Droplet,
  Bug,
  AlertTriangle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  category?: string;
}

interface Suggestion {
  text: string;
  category: string;
  icon: any;
}

const AIChatbot: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message in current language
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: '1',
        content: t('welcomeMessage', "Hello! I'm your AI Health Assistant. How can I assist you today?"),
        type: 'bot' as const,
        timestamp: new Date(),
        category: 'greeting'
      };
      setMessages([welcomeMessage]);
    }
  }, [i18n.language, messages.length, t]);

  const getSuggestions = (): Suggestion[] => {
    const suggestions: Record<string, Suggestion[]> = {
      en: [
        { text: "How to purify water safely?", category: "water", icon: Droplet },
        { text: "Symptoms of waterborne diseases", category: "health", icon: AlertTriangle },
        { text: "Proper hand washing steps", category: "hygiene", icon: Sparkles }
      ],
      hi: [
        { text: "पानी को सुरक्षित रूप से कैसे शुद्ध करें?", category: "water", icon: Droplet },
        { text: "जल जनित रोगों के लक्षण", category: "health", icon: AlertTriangle },
        { text: "हाथ धोने के सही तरीके", category: "hygiene", icon: Sparkles }
      ],
      bn: [
        { text: "কিভাবে নিরাপদে পানি বিশুদ্ধ করবেন?", category: "water", icon: Droplet },
        { text: "পানিবাহিত রোগের লক্ষণ", category: "health", icon: AlertTriangle },
        { text: "সঠিক হাত ধোয়ার নিয়ম", category: "hygiene", icon: Sparkles }
      ]
    };
    return suggestions[i18n.language] || suggestions.en;
  };

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
        }
      }
    };
    loadVoices();
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled || !text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    const botMessageId = (Date.now() + 1).toString();
    const newBotMessage: Message = {
      id: botMessageId,
      content: '',
      type: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newBotMessage]);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToProcess, language: i18n.language })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        updateBotMessage(botMessageId, data.response);
      } else {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulatedResponse += chunk;
            updateBotMessage(botMessageId, accumulatedResponse);
          }
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      updateBotMessage(botMessageId, t('errorMessage', "Sorry, I encountered an error. Please try again."));
    } finally {
      setIsTyping(false);
    }
  };

  const updateBotMessage = (id: string, content: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content } : msg
    ));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• (.*?)(\n|$)/g, '• $1<br/>')
      .replace(/(\d+\. )(.*?)(\n|$)/g, '$1$2<br/>')
      .split('\n').join('<br/>');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }}`}>
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm">{t('chatbot')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-8 h-8 p-0 hover:bg-white/20 ${voiceEnabled ? 'text-green-200' : 'text-white/60'}`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${ 
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'bot' && <Bot className="w-4 h-4 mt-1 text-blue-500" />}
                          {message.type === 'user' && <User className="w-4 h-4 mt-1" />}
                          <div 
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1">
                    {getSuggestions().map((suggestion, index) => {
                      const Icon = suggestion.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {suggestion.text.split(' ').slice(0, 2).join(' ')}...
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={t('askQuestion', "Ask a question...")}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIChatbot;
