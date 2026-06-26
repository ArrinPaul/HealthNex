"use client";

import { useState, useRef, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Sparkles, AlertTriangle, 
  Mic, MicOff, RefreshCw, Bot, HelpCircle, 
  Clock, ArrowLeft, Volume2, ShieldCheck, Heart,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function DedicatedChatbotPage() {
  const { user, token } = useAuth();
  const { language } = useSettings();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: language === 'hi' 
        ? 'नमस्ते! मैं हेल्थनेक्स एआई सहायक हूँ। मैं पानी की सुरक्षा, रोग नियंत्रण, स्वच्छता और आपातकालीन स्वास्थ्य प्रश्नों में आपकी मदद कर सकता हूँ। आप मुझसे कुछ भी पूछ सकते हैं!'
        : language === 'bn'
        ? 'নমস্কার! আমি হেলথনেক্স এআই সহকারী। আমি জল সুরক্ষা, রোগ নিয়ন্ত্রণ, স্বাস্থ্যবিধি এবং জরুরি স্বাস্থ্য বিষয়ে আপনাকে সাহায্য করতে পারি। আপনি আমাকে যেকোনো প্রশ্ন করতে পারেন!'
        : 'Hello! I am the HealthNex AI Assistant. I can help you with water safety, disease prevention, hygiene protocols, and emergency health guidelines. Feel free to ask me anything!',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim()) return;

    const userMessageText = rawText.trim();
    if (!textToSend) setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText, language: language || 'en' })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Health Assistant API.");
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/plain') && response.body) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumText = "";

        // Add initial empty message from assistant
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: "",
          timestamp: new Date()
        }]);

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: !done });
          accumText += chunk;

          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: accumText
              };
            }
            return updated;
          });
        }
      } else {
        // Fallback JSON handling
        const data = await response.json();
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.response || data.error || 'No response compiled by assistant.',
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error("Chatbot transmission failed:", error);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: language === 'hi' 
          ? 'क्षमा करें, संदेश संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।'
          : language === 'bn'
          ? 'দুঃখিত, বার্তাটি প্রক্রিয়াকরণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'I apologize, but I encountered an error processing your query. Please verify your connection and try again.',
        timestamp: new Date()
      }]);
      toast.error("Transmission Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      toast.error('Voice Capture Not Supported', { description: 'Your browser does not support the Web Speech API.' });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Voice Input Active', { description: `Listening in ${recognition.lang}...` });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
      toast.success('Speech recognized successfully.');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice Capture Failed', { description: 'Could not process audio stream.' });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const clearChatHistory = () => {
    setMessages([
      {
        sender: 'assistant',
        text: language === 'hi' 
          ? 'नमस्ते! मैं हेल्थनेक्स एआई सहायक हूँ। मैं पानी की सुरक्षा, रोग नियंत्रण, स्वच्छता और आपातकालीन स्वास्थ्य प्रश्नों में आपकी मदद कर सकता हूँ। आप मुझसे कुछ भी पूछ सकते हैं!'
          : language === 'bn'
          ? 'নমস্কার! আমি হেলথনেক্স এআই সহকারী। আমি জল সুরক্ষা, রোগ নিয়ন্ত্রণ, স্বাস্থ্যবিধি এবং জরুরি স্বাস্থ্য বিষয়ে আপনাকে সাহায্য করতে পারি। আপনি আমাকে যেকোনো প্রশ্ন করতে পারেন!'
          : 'Hello! I am the HealthNex AI Assistant. I can help you with water safety, disease prevention, hygiene protocols, and emergency health guidelines. Feel free to ask me anything!',
        timestamp: new Date()
      }
    ]);
    toast.info("Conversation history cleared.");
  };

  // Suggested Inquiry Chips
  const suggestionChips = language === 'hi' ? [
    { label: "पीने के पानी को कैसे कीटाणुरहित करें?", text: "पीने के पानी को कीटाणुरहित करने के तरीके क्या हैं?" },
    { label: "हैजा के लक्षण क्या हैं?", text: "हैजा के सामान्य लक्षण क्या हैं?" },
    { label: "मच्छरों के प्रजनन को कैसे रोकें?", text: "मच्छरों के प्रजनन को रोकने के उपाय बताइए" },
    { label: "आपातकालीन स्वास्थ्य हेल्पलाइन", text: "आपातकालीन स्वास्थ्य हेल्पलाइन नंबर क्या हैं?" }
  ] : language === 'bn' ? [
    { label: "খাওয়ার জল কীভাবে জীবাণুমুক্ত করবেন?", text: "খাওয়ার জল জীবাণুমুক্ত করার উপায় কী?" },
    { label: "কলেরার লক্ষণগুলি কী কী?", text: "কলেরার সাধারণ লক্ষণগুলি কী কী?" },
    { label: "মশার বংশবৃদ্ধি কীভাবে রোধ করা যায়?", text: "মশার বংশবৃদ্ধি রোধ করার উপায় বলুন" },
    { label: "জরুরি স্বাস্থ্য হেল্পলাইন", text: "জরুরি স্বাস্থ্য হেল্পলাইন নম্বরগুলি কী?" }
  ] : [
    { label: "How to sanitize drinking water?", text: "What are the best methods to sanitize drinking water?" },
    { label: "Common cholera symptoms", text: "What are the common symptoms of cholera?" },
    { label: "Mosquito breeding control", text: "How can we control mosquito breeding in the community?" },
    { label: "Emergency health contacts", text: "What are the emergency health helpline numbers?" }
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[850px] gap-4 text-left animate-in fade-in duration-500 relative">
        {/* Glow decorations */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Header section */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Bot className="w-5.5 h-5.5 text-primary animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-foreground">Health AI Desk</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-bold uppercase tracking-wider">
                  Gemini Agent
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-mono">
                Decentralized Public Health Expert System
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChatHistory}
              className="h-9 px-3 rounded-xl border-border text-[10px] font-bold uppercase gap-1.5 hover:bg-secondary"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              Clear History
            </Button>
          </div>
        </div>

        {/* Chat Interface Container */}
        <Card className="flex-1 min-h-0 bg-card/65 backdrop-blur-xl border border-border shadow-xl rounded-2xl flex flex-col overflow-hidden">
          {/* Scrollable message box */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin text-xs">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
                  >
                    {/* Profile avatar */}
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      {/* Message speech bubble */}
                      <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-semibold transition-all shadow-sm ${
                        isUser 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-secondary/40 text-foreground border-border/80'
                      }`}>
                        {msg.text ? (
                          <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-[8px] text-muted-foreground/60 font-mono flex items-center gap-1 px-1 justify-end">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{format(msg.timestamp, 'HH:mm')}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips Drawer */}
          <div className="px-5 py-2.5 border-t border-border/40 bg-secondary/10 shrink-0 flex flex-col gap-1.5">
            <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-primary" /> Suggested Inquiries
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  disabled={loading}
                  className="px-2.5 py-1 text-[9px] font-bold text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary rounded-lg transition-all truncate max-w-full"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input control tray */}
          <div className="p-4 border-t border-border/40 bg-secondary/35 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2.5 items-center"
            >
              {/* Voice input */}
              <Button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading || isListening}
                variant="outline"
                className={`h-11 w-11 rounded-xl shrink-0 border-border hover:bg-secondary ${
                  isListening ? 'border-rose-500 text-rose-400 bg-rose-500/5 animate-pulse' : 'text-muted-foreground'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-primary" />}
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask Gemini health assistant..."}
                disabled={loading}
                className="flex-1 h-11 bg-secondary border border-border px-3 rounded-xl text-xs focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />

              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:scale-[1.01] transition-all shadow-md shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
            
            <div className="flex items-center gap-3.5 mt-3 justify-center text-[9px] text-muted-foreground/80 font-mono">
              <span className="flex items-center gap-1 text-emerald-500/90 font-bold uppercase">
                <ShieldCheck className="w-3 h-3" /> Secure SSL Connection
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold uppercase">
                <Heart className="w-3 h-3 text-rose-400" /> For informational purposes
              </span>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
