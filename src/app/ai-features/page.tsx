"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  MessageSquare,
  BarChart3,
  Zap,
  Eye,
  MapPin,
  Mic,
  MicOff,
  Shield,
  Book,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Droplet,
  Calendar,
  X
} from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

export default function AIFeaturesPage() {
  const { token } = useAuth();
  const trackUsage = useMutation(api.usage.trackUsage as any);
  const [activeProtocol, setActiveProtocol] = useState<'diagnostics' | 'predictive'>('diagnostics');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const { language } = useSettings();
  
  // Inputs
  const [symptoms, setSymptoms] = useState('');
  const [healthQuery, setHealthQuery] = useState('');
  const [location, setLocation] = useState('');

  // ML Predictor Inputs
  const [popDensity, setPopDensity] = useState(250);
  const [sanitationScore, setSanitationScore] = useState(75);
  const [waterAccess, setWaterAccess] = useState(85);

  // Chat History
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string, sources?: string[] }>>([
    { sender: 'assistant', text: 'Ask me anything about cholera prevention, water safety, or vector-borne disease control.' }
  ]);

  const startVoiceCapture = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      toast.error('Voice Capture Not Supported', { description: 'Your browser does not support the Web Speech API.' });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening...', { description: `Listening for symptoms in ${recognition.lang}...` });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev}, ${transcript}` : transcript);
      setIsListening(false);
      toast.success('Voice input added.');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice Capture Failed', { description: 'Could not process audio stream.' });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const fillSymptomPreset = (presetType: 'waterborne' | 'vector' | 'influenza') => {
    if (presetType === 'waterborne') {
      setSymptoms('severe watery diarrhea, abdominal cramps, dehydration, nausea');
    } else if (presetType === 'vector') {
      setSymptoms('sudden high fever, severe joint pain, muscle aches, back headache, skin rash');
    } else {
      setSymptoms('dry cough, sore throat, running nose, high fever, chest congestion');
    }
    toast.info('Preset symptoms loaded.');
  };

  // AI Symptom Analysis
  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Input required', { description: 'Please enter symptoms to analyze.' });
      return;
    }
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: symptoms.split(',').map(s => s.trim()),
          location: location || undefined
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResults({ type: 'symptoms', data });
        toast.success('Analysis complete.');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Analysis failed', { description: error.message || 'Check connection.' });
    } finally {
      setLoading(false);
    }
  };

  // AI Chat Assistant
  const submitHealthQuery = async (queryText?: string) => {
    const textToSubmit = queryText || healthQuery;
    if (!textToSubmit.trim()) return;

    // Add user message to chat
    setChatMessages(prev => [...prev, { sender: 'user', text: textToSubmit }]);
    if (!queryText) setHealthQuery('');
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/health-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSubmit, location })
      });
      
      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, { 
          sender: 'assistant', 
          text: data.answer, 
          sources: data.sources 
        }]);
      } else {
        throw new Error(data.error || 'Query failed');
      }
    } catch (error: any) {
      console.error('Error processing query:', error);
      setChatMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: `Error: ${error.message || 'Failed to connect to health advisory server.'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ML Outbreak Prediction
  const runOutbreakPrediction = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          populationDensity: popDensity,
          sanitationData: sanitationScore,
          waterAccess: waterAccess
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResults({ type: 'outbreak', data });
        toast.success('Epidemiological model simulation complete.');
        if (token) trackUsage({ token, feature: 'outbreak_prediction', status: 'success' }).catch(() => {});
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error: any) {
      console.error('Outbreak prediction failed:', error);
      toast.error('Simulation failed', { description: error.message || 'Service offline.' });
    } finally {
      setLoading(false);
    }
  };

  // ML Health Trends Forecast
  const runHealthForecast = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/health-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthData: [
            { community: 'North Ward A', incidents: popDensity > 400 ? 65 : 25 },
            { community: 'South Slums B', incidents: sanitationScore < 60 ? 80 : 35 },
            { community: 'East Sector C', incidents: 20 }
          ]
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResults({ type: 'forecast', data });
        toast.success('Community health trend forecast updated.');
        if (token) trackUsage({ token, feature: 'health_forecast', status: 'success' }).catch(() => {});
      } else {
        throw new Error(data.error || 'Forecast failed');
      }
    } catch (error: any) {
      console.error('Forecasting failed:', error);
      toast.error('Forecast failed', { description: error.message || 'Service offline.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">AI Engine Online</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Brain className="w-7 h-7 text-primary" /> AI & ML Features
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Early-warning models and AI-assisted clinical diagnostics
            </p>
          </div>

          {/* Custom Tabs Navigation */}
          <div className="flex bg-secondary/60 border border-border/70 p-1.5 rounded-xl shrink-0 gap-1.5 shadow-sm">
            <button
              onClick={() => {
                setActiveProtocol('diagnostics');
                setResults(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeProtocol === 'diagnostics'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="w-4 h-4" />
              AI Diagnostics
            </button>
            <button
              onClick={() => {
                setActiveProtocol('predictive');
                setResults(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeProtocol === 'predictive'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Predictive Engines
            </button>
          </div>
        </div>

        {/* Protocol Panels */}
        <AnimatePresence mode="wait">
          {activeProtocol === 'diagnostics' ? (
            /* AI DIAGNOSTICS SUITE */
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column (8 Cols): Diagnostic Tools */}
              <div className="lg:col-span-8 space-y-6">
                {/* Symptom Ingestion Center */}
                <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden text-left">
                  <CardHeader className="border-b border-border bg-secondary/30 py-4 px-5">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Symptom Checker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {/* Presets Row */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Quick Presets</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => fillSymptomPreset('waterborne')}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase border border-border hover:border-primary/40 bg-secondary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                        >
                          Waterborne Symptoms
                        </button>
                        <button
                          onClick={() => fillSymptomPreset('vector')}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase border border-border hover:border-primary/40 bg-secondary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                        >
                          Vector-borne Symptoms
                        </button>
                        <button
                          onClick={() => fillSymptomPreset('influenza')}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase border border-border hover:border-primary/40 bg-secondary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                        >
                          Influenza Symptoms
                        </button>
                      </div>
                    </div>

                    {/* Symptoms Field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="symptoms" className="text-[10px] font-bold uppercase text-muted-foreground">Symptoms (comma-separated)</Label>
                        <Button
                          onClick={startVoiceCapture}
                          disabled={isListening}
                          variant="outline"
                          className={`h-7 px-3 text-[9px] font-semibold rounded-lg border-border hover:bg-secondary gap-1.5 ${
                            isListening ? 'border-rose-500 text-rose-500 bg-rose-500/5 animate-pulse' : 'text-foreground'
                          }`}
                        >
                          {isListening ? <MicOff className="w-3 h-3 text-rose-500" /> : <Mic className="w-3 h-3 text-primary" />}
                          {isListening ? 'Listening...' : 'Voice Input'}
                        </Button>
                      </div>
                      <Textarea
                        id="symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe observed symptoms (e.g. high fever, severe watery stool, cramps, chills)..."
                        className="min-h-[100px] rounded-lg bg-secondary/30 border-border p-3 text-xs placeholder:text-muted-foreground/60 resize-none text-foreground focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Optional Location */}
                      <div className="space-y-1.5">
                        <Label htmlFor="symptom-loc" className="text-[10px] font-bold uppercase text-muted-foreground">District (Optional)</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            id="symptom-loc"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Kozhikode, Kerala"
                            className="pl-9 rounded-lg bg-secondary/30 border-border text-xs focus:ring-1 focus:ring-primary text-foreground"
                          />
                        </div>
                      </div>

                      {/* Run diagnostics button */}
                      <div className="flex items-end">
                        <Button
                          onClick={analyzeSymptoms}
                          disabled={loading || !symptoms.trim()}
                          className="w-full h-9 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Intelligence Output Results Drawer */}
                <AnimatePresence mode="wait">
                  {results && results.type === 'symptoms' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden text-left">
                        <CardHeader className="border-b border-border bg-primary/5 py-4 px-5 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-primary flex items-center gap-2.5">
                            <Eye className="w-4 h-4" /> Diagnostic Report
                          </CardTitle>
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border leading-normal ${
                            results.data.urgency === 'high' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
                            results.data.urgency === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                          }`}>
                            {results.data.urgency} Urgency
                          </span>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4 text-xs">
                          {/* Diagnostic Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 bg-secondary/30 border border-border rounded-xl p-4">
                              <span className="text-[10px] text-muted-foreground block font-bold uppercase mb-1">Analysis</span>
                              <p className="text-foreground leading-relaxed font-semibold">{results.data.analysis}</p>
                            </div>
                            <div className="bg-secondary/30 border border-border rounded-xl p-4 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-bold uppercase mb-1">Likely Cause</span>
                                <span className="font-bold text-foreground text-sm">{results.data.diagnosis}</span>
                              </div>
                              <div className="pt-3 border-t border-border/60 mt-3 flex justify-between items-center">
                                <span className="text-[9px] text-muted-foreground font-semibold">Model Confidence</span>
                                <span className="font-mono font-bold text-primary text-xs">{Math.round(results.data.confidence * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Action recommendations */}
                          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2.5">
                            <span className="text-[10px] text-primary block font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" /> Recommended Actions
                            </span>
                            <ul className="space-y-1.5 text-foreground font-medium pl-1">
                              {results.data.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Disclaimer */}
                          <div className="text-[9px] text-muted-foreground/80 italic font-mono flex gap-1.5 p-2 bg-secondary/15 rounded border border-border/30">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{results.data.disclaimer}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column (4 Cols): Chat Assistant */}
              <div className="lg:col-span-4 flex flex-col h-full">
                <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex flex-col h-[400px] text-left">
                  <CardHeader className="border-b border-border bg-secondary/30 py-3.5 px-4 flex flex-row items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Health Assistant</h3>
                    </div>
                  </CardHeader>
                  
                  {/* Chat scrolling panel */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin text-xs">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'user' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl leading-relaxed font-semibold border ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-secondary/40 text-foreground border-border'
                        }`}>
                          {msg.text}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[8px] text-muted-foreground font-mono">
                            <span>Sources:</span>
                            {msg.sources.map((src, sIdx) => (
                              <span key={sIdx} className="bg-secondary px-1 py-0.25 rounded border border-border/40">{src}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Starter Prompts */}
                  <div className="px-4 py-2 border-t border-border/60 bg-secondary/10 shrink-0 flex flex-col gap-1.5">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Suggested Questions</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "How to sanitize drinking water?",
                        "What is malaria treatment?",
                        "Vector breeding warning signs"
                      ].map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => submitHealthQuery(prompt)}
                          disabled={loading}
                          className="px-2 py-0.75 text-[9px] font-semibold text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 rounded transition-colors truncate max-w-full"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message submit form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitHealthQuery();
                    }}
                    className="p-3 border-t border-border bg-secondary/35 shrink-0 flex gap-2 items-center"
                  >
                    <input
                      value={healthQuery}
                      onChange={(e) => setHealthQuery(e.target.value)}
                      placeholder="Ask a public health question..."
                      disabled={loading}
                      className="flex-1 bg-secondary border border-border px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !healthQuery.trim()}
                      className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </form>
                </Card>
              </div>
            </motion.div>
          ) : (
            /* ML PREDICTIVE ENGINES */
            <motion.div
              key="predictive"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column (5 Cols): ML Inputs */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-border bg-secondary/30 py-4 px-5">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-primary" /> Simulation Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {/* Slider 1: Pop Density */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Population Density</span>
                        <span className="font-mono text-foreground">{popDensity} per km²</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="10"
                        value={popDensity}
                        onChange={(e) => setPopDensity(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Slider 2: Sanitation */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Sanitation Infrastructure Index</span>
                        <span className="font-mono text-foreground">{sanitationScore}% coverage</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={sanitationScore}
                        onChange={(e) => setSanitationScore(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Slider 3: Clean Water Access */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Potable Water Safety Access</span>
                        <span className="font-mono text-foreground">{waterAccess}% compliance</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={waterAccess}
                        onChange={(e) => setWaterAccess(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Simulation buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        onClick={runOutbreakPrediction}
                        disabled={loading}
                        className="h-10 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Run Predictor
                      </Button>
                      <Button
                        onClick={runHealthForecast}
                        disabled={loading}
                        variant="outline"
                        className="h-10 rounded-lg text-xs font-semibold border-border hover:bg-secondary text-foreground flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                        Generate Forecast
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Status */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'Outbreak Model', status: 'Active', icon: Brain, color: 'text-primary' },
                    { title: 'Response Time', status: '~12 ms', icon: Zap, color: 'text-amber-500' },
                    { title: 'Data Integrity', status: 'Validated', icon: Shield, color: 'text-emerald-500' }
                  ].map((stat, i) => (
                    <Card key={i} className="bg-card border border-border p-4 flex flex-col justify-between min-h-[100px]">
                      <div className="flex justify-between items-center">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-left mt-3">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase block">{stat.title}</span>
                        <span className="text-xs font-mono font-bold text-foreground uppercase">{stat.status}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column (7 Cols): Outbreak Outputs */}
              <div className="lg:col-span-7 text-left">
                <AnimatePresence mode="wait">
                  {results ? (
                    <motion.div
                      key={results.type}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      {results.type === 'outbreak' && (
                        /* Prediction Output */
                        <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                          <CardHeader className="border-b border-border/40 bg-secondary/30 py-4 px-5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2.5">
                              <Eye className="w-4 h-4 text-primary" /> Outbreak Risk Assessment
                            </CardTitle>
                            <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border leading-normal ${
                              results.data.severity === 'high' || results.data.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                              results.data.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                              'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            }`}>
                              {results.data.severity} Risk
                            </span>
                          </CardHeader>
                          <CardContent className="p-5 space-y-4 text-xs">
                            {/* Probability & Peak Window Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-secondary/35 border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center min-h-[110px]">
                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Outbreak Probability</span>
                                <div className="relative flex items-center justify-center">
                                  {/* Simple Ring Visualizer */}
                                  <svg className="w-16 h-16" viewBox="0 0 80 80">
                                    <circle className="text-secondary/20" strokeWidth="6" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                                    <circle className="text-primary" strokeWidth="6" strokeDasharray="201" strokeDashoffset={201 - (201 * results.data.probability) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                                  </svg>
                                  <span className="absolute font-mono font-bold text-sm text-foreground">{results.data.probability}%</span>
                                </div>
                              </div>

                              <div className="bg-secondary/30 border border-border/60 rounded-xl p-4 flex flex-col justify-between min-h-[110px]">
                                <div>
                                  <span className="text-[9px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">Peak Incident Window</span>
                                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5 mt-1">
                                    <Calendar className="w-4 h-4 text-primary" /> {results.data.peakWindow}
                                  </span>
                                </div>
                                <span className="text-[8px] text-muted-foreground leading-normal mt-2 block font-mono">Calculated using historic outbreak timelines.</span>
                              </div>
                            </div>

                            {/* Factor Diagnostics (Full Width) */}
                            <div className="bg-secondary/30 border border-border/60 rounded-xl p-4">
                              <span className="text-[9px] text-muted-foreground block font-bold uppercase tracking-wider mb-2">Factor Diagnostics</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[9px] font-bold">
                                {Object.entries(results.data.factors || {}).map(([factor, val]: [string, any]) => (
                                  <div key={factor} className="p-2.5 rounded-lg bg-secondary/50 border border-border/40 flex flex-col justify-between">
                                    <span className="text-muted-foreground truncate mb-1">{factor}</span>
                                    <span className="text-foreground text-[10px] font-bold">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2.5">
                              <span className="text-[10px] text-primary block font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Recommended Early Actions
                              </span>
                              <ul className="space-y-1.5 text-foreground font-medium pl-1">
                                {results.data.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {results.type === 'forecast' && (
                        /* Forecast Output */
                        <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                          <CardHeader className="border-b border-border bg-secondary/30 py-4 px-5">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2.5">
                              <BarChart3 className="w-4 h-4 text-primary" /> District Health Forecast
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5 space-y-4 text-xs">
                            <div className="p-4 bg-secondary/30 border border-border/60 rounded-xl">
                              <span className="text-[9px] text-muted-foreground block font-bold uppercase mb-1">Forecast Synthesis</span>
                              <p className="text-foreground leading-relaxed font-semibold">{results.data.forecastSummary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* High Risk Communities */}
                              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                                <span className="text-[9px] text-rose-500 block font-bold uppercase mb-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> High-Risk Areas
                                </span>
                                {results.data.highRiskAreas.length === 0 ? (
                                  <span className="italic text-muted-foreground">No critical risk sectors flagged.</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {results.data.highRiskAreas.map((area: string, idx: number) => (
                                      <Badge key={idx} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded px-2 text-[9px] font-bold">
                                        {area}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Predicted Trend Numbers */}
                              <div className="bg-secondary/30 border border-border/60 rounded-xl p-4">
                                <span className="text-[9px] text-muted-foreground block font-bold uppercase mb-2">Projected Trend</span>
                                <div className="space-y-1.5 font-mono text-[9px] font-bold">
                                  {results.data.trends.map((t: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center py-0.5 border-b border-border/20">
                                      <span className="text-muted-foreground">Month of {t.month}</span>
                                      <span className="text-primary">{t.predictedIncidents} estimated cases</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ) : (
                    /* Default Placeholder */
                    <div className="border border-dashed border-border rounded-xl h-[300px] flex flex-col items-center justify-center text-muted-foreground text-xs p-6 bg-secondary/10">
                      <Brain className="w-8 h-8 text-muted-foreground/50 mb-3" />
                      <p className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Outbreak Simulator</p>
                      <p className="text-[9px] text-muted-foreground/60 text-center max-w-[280px] mt-1">Adjust the sliders and run the outbreak predictor or forecast engine to see simulated risk alerts.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
