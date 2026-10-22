"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SymptomCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  forceOnboarding?: boolean; // If true, hide the close button until completed
}

export default function SymptomCheckerModal({ isOpen, onClose, onComplete, forceOnboarding = false }: SymptomCheckerModalProps) {
  const { token } = useAuth();
  const saveAssessment = useMutation(api.healthAssessments.saveAssessment as any);
  
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([
    { role: "assistant", content: "Hello! I'm the HealthNex AI Triage Assistant. To help figure out what might be wrong, could you tell me what symptoms you are experiencing right now?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Check if it's a JSON prediction
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const prediction = JSON.parse(jsonMatch[0]);
          if (prediction.prediction) {
            const sanitizedScore = typeof prediction.score === 'number'
              ? Math.min(95, Math.max(10, Math.round(prediction.score)))
              : 70;
            const sanitizedPrediction = {
              ...prediction,
              score: sanitizedScore,
              disclaimer: prediction.disclaimer || "This is an automated educational assessment, not a clinical diagnosis. Always consult a healthcare professional."
            };
            setResult(sanitizedPrediction);
            // Save to DB
            await saveAssessment({
              token: token || "",
              predictedDisease: String(prediction.prediction).slice(0, 150),
              predictionScore: sanitizedScore,
              symptomsProvided: Array.isArray(prediction.symptoms) ? prediction.symptoms.slice(0, 10) : [],
              notes: prediction.reasoning ? String(prediction.reasoning).slice(0, 500) : undefined
            });
            toast.success("Health assessment saved successfully!");
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Not JSON, continue chatting
      }

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      toast.error("Error communicating with AI: " + err.message);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I ran into a network error. Could you repeat that?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-bold">AI Symptom Assessor</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={forceOnboarding ? "Skip symptom check" : "Close"}
            title={forceOnboarding ? "Skip for now" : "Close"}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {forceOnboarding && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-600/90 dark:text-amber-400">
              <strong className="block mb-0.5">Welcome to HealthNex!</strong>
              As a new community user, please complete this brief symptom check to personalize your experience.
            </div>
          </div>
        )}

        {result ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Assessment Complete</h3>
            <div className="p-4 bg-secondary/40 rounded-xl border border-border/50 w-full text-left">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">Possible Condition (For Discussion with Doctor)</div>
              <div className="text-lg font-bold text-primary mb-3">{result.prediction}</div>
              
              <div className="flex items-center justify-between text-sm border-t border-border/50 pt-3 mt-3">
                <span className="text-muted-foreground">Symptom Correlation</span>
                <span className="font-bold text-emerald-500">{result.score}%</span>
              </div>
            </div>
            {result.reasoning && (
              <p className="text-xs text-muted-foreground italic text-left w-full">
                {result.reasoning}
              </p>
            )}

            {/* Clinical Disclaimer */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-xs text-amber-600 dark:text-amber-400 w-full space-y-1">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <strong className="block font-semibold">Clinical Disclaimer</strong>
                  This automated assessment is provided for educational and triage guidance only. It is not a clinical diagnosis or treatment plan. Always consult a qualified medical professional for diagnosis. If you are experiencing severe symptoms or an emergency, call 108 immediately.
                </div>
              </div>
            </div>

            <Button onClick={() => { onClose(); onComplete(); }} className="w-full mt-4 bg-primary text-primary-foreground font-bold">
              {forceOnboarding ? "Continue to Dashboard" : "Close"}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin flex flex-col h-[400px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-xl text-sm shadow-sm ${
                    msg.role === "assistant" ? "bg-secondary/40 border border-border/40 text-foreground" : "bg-primary text-primary-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-secondary/10 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 bg-card border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="h-auto w-12 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center p-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
