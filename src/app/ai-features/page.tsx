"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Droplet, 
  Users, 
  MessageSquare,
  BarChart3,
  Zap,
  Eye,
  Heart,
  MapPin,
  Mic,
  MicOff
} from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

export default function AIFeaturesPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const { language } = useSettings();
  
  // Input states
  const [symptoms, setSymptoms] = useState('');
  const [healthQuery, setHealthQuery] = useState('');
  const [location, setLocation] = useState('');

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
      toast.info('Voice Protocol Active', { description: `Listening for symptoms in ${recognition.lang}...` });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev}, ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice Capture Failed', { description: 'Could not process audio stream.' });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Test AI Symptom Analysis
  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptoms.split(',').map(s => s.trim()) })
      });
      
      const data = await response.json();
      setResults({ type: 'symptoms', data });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setResults({
        type: 'error',
        message: 'Failed to analyze symptoms. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Health Query AI
  const askHealthQuestion = async () => {
    if (!healthQuery.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/health-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: healthQuery, location })
      });
      
      const data = await response.json();
      setResults({ type: 'query', data });
    } catch (error) {
      console.error('Error processing health query:', error);
      setResults({
        type: 'error',
        message: 'Failed to process health query. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Disease Outbreak Prediction
  const predictOutbreak = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          populationDensity: 250,
          sanitationData: 75,
          historicalPatterns: [1, 2, 1, 3, 2, 1]
        })
      });
      
      const data = await response.json();
      setResults({ type: 'outbreak', data });
    } catch (error) {
      console.error('Error predicting outbreak:', error);
      setResults({
        type: 'error',
        message: 'Outbreak prediction service is currently unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Health Forecast
  const generateHealthForecast = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/health-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthData: [
            { community: 'District A', incidents: 25 },
            { community: 'District B', incidents: 60 },
            { community: 'District C', incidents: 15 }
          ]
        })
      });
      
      const data = await response.json();
      setResults({ type: 'forecast', data });
    } catch (error) {
      console.error('Error generating forecast:', error);
      setResults({
        type: 'error',
        message: 'Health forecasting is currently unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  // AI Features List
  const aiFeatures = [
    {
      id: 'symptoms',
      title: 'AI Symptom Analysis',
      description: 'Analyze symptoms to identify potential waterborne diseases',
      icon: Activity,
      color: 'from-cyan-400 to-sky-500',
      action: analyzeSymptoms
    },
    {
      id: 'query',
      title: 'Health Assistant',
      description: 'Ask health-related questions and get AI-powered answers',
      icon: MessageSquare,
      color: 'from-emerald-400 to-teal-500',
      action: askHealthQuestion
    },
    {
      id: 'outbreak',
      title: 'Outbreak Prediction',
      description: 'ML-powered disease outbreak prediction and early warning',
      icon: TrendingUp,
      color: 'from-rose-500 to-amber-500',
      action: predictOutbreak
    },
    {
      id: 'forecast',
      title: 'Health Forecasting',
      description: 'Predict community health trends using historical data',
      icon: BarChart3,
      color: 'from-violet-500 to-fuchsia-500',
      action: generateHealthForecast
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">🤖 AI & ML Features</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">
            Intelligence Protocol Analytical Suite
          </p>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-[var(--surface-2)]">
            <TabsTrigger value="features" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">AI Tools</TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">ML Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Symptom Analysis Input */}
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-[var(--border-soft)] bg-primary/5">
                  <CardTitle className="flex items-center gap-3 text-lg uppercase font-bold tracking-tight">
                    <Activity className="w-5 h-5 text-primary" />
                    Symptom Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                       <Label htmlFor="symptoms" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Ground Telemetry (Symptoms)</Label>
                       <Button 
                         type="button" 
                         variant="outline" 
                         size="sm" 
                         onClick={startVoiceCapture}
                         className={`h-9 gap-3 rounded-xl px-4 border-[var(--border-soft)] transition-all ${isListening ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'text-primary hover:bg-primary/5'}`}
                       >
                          {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{isListening ? 'Listening...' : 'Voice Capture'}</span>
                       </Button>
                    </div>
                    <Textarea
                      id="symptoms"
                      placeholder="e.g., severe dehydration, high fever, abdominal cramps"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="min-h-[140px] rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] p-6 text-lg"
                    />
                  </div>
                  <Button onClick={analyzeSymptoms} disabled={loading} className="w-full h-16 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                    <Zap className="w-5 h-5 mr-3" />
                    Run Neural Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Health Query Input */}
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-[var(--border-soft)] bg-emerald-500/5">
                  <CardTitle className="flex items-center gap-3 text-lg uppercase font-bold tracking-tight text-emerald-500">
                    <MessageSquare className="w-5 h-5" />
                    Health Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="query" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Protocol Inquiry</Label>
                       <Textarea
                         id="query"
                         placeholder="How can we prevent cholera in rural areas?"
                         value={healthQuery}
                         onChange={(e) => setHealthQuery(e.target.value)}
                         className="min-h-[100px] rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)] p-6"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Regional Context</Label>
                       <div className="relative group">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                          <Input
                            id="location"
                            placeholder="Current Region..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-14 pl-14 rounded-2xl bg-[var(--surface-2)] border-[var(--border-soft)]"
                          />
                       </div>
                    </div>
                  </div>
                  <Button onClick={askHealthQuestion} disabled={loading} className="w-full h-16 rounded-2xl text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                    <Brain className="w-5 h-5 mr-3" />
                    Query Gemini Assistant
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Display */}
            {results && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="backdrop-blur-xl bg-[var(--surface-2)]/40 border border-[var(--border-soft)] shadow-2xl overflow-hidden">
                  <CardHeader className="border-b border-[var(--border-soft)] py-6">
                    <CardTitle className="flex items-center gap-3 text-sm uppercase font-bold tracking-[0.2em]">
                      <Eye className="w-4 h-4 text-primary" />
                      Intelligence Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                    {results.type === 'symptoms' && (
                      <div className="space-y-8">
                        <div className="p-8 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl shadow-sm">
                          <h4 className="font-bold uppercase tracking-widest text-[10px] text-primary mb-4">Neural Analysis Summary</h4>
                          <p className="text-xl leading-relaxed font-medium">{results.data.analysis}</p>
                        </div>
                        <div className="flex flex-wrap gap-6 items-center">
                          {results.data.urgency && (
                            <Badge className={`h-10 px-6 rounded-full text-xs font-bold uppercase tracking-widest ${
                              results.data.urgency === 'High' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              Protocol Urgency: {results.data.urgency}
                            </Badge>
                          )}
                          <div className="flex items-center gap-3 text-muted-foreground">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Verified by Gemini v1.5</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.type === 'query' && (
                      <div className="space-y-6">
                        <div className="p-8 bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-3xl shadow-sm border-l-4 border-l-emerald-500">
                          <h4 className="font-bold uppercase tracking-widest text-[10px] text-emerald-500 mb-4">Assistant Response</h4>
                          <p className="text-xl leading-relaxed font-medium">{results.data.answer}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'AI Operational', icon: Brain, label: 'Gemini v1.5 Pro', color: 'text-primary' },
                  { title: 'Processing', icon: Zap, label: 'Real-time', color: 'text-amber-500' },
                  { title: 'Sync Fidelity', icon: Shield, label: 'High-Integrity', color: 'text-emerald-500' }
                ].map((stat, i) => (
                  <Card key={i} className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-lg hover:border-primary/30 transition-all">
                    <CardContent className="p-8 flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center ${stat.color}`}>
                          <stat.icon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</p>
                          <p className="text-lg font-bold uppercase tracking-tight">{stat.label}</p>
                       </div>
                    </CardContent>
                  </Card>
                ))}
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
               {[
                 { action: predictOutbreak, icon: TrendingUp, label: 'Outbreak Vector' },
                 { action: generateHealthForecast, icon: BarChart3, label: 'Health Trends' },
                 { action: () => setResults(null), icon: Eye, label: 'Clear Cache' },
                 { action: () => window.open('/documentation', '_blank'), icon: Book, label: 'View Protocol' }
               ].map((btn, i) => (
                 <Button key={i} onClick={btn.action} variant="outline" className="h-24 rounded-2xl flex-col gap-3 border-[var(--border-soft)] hover:border-primary/40 hover:bg-primary/5 transition-all group">
                    <btn.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{btn.label}</span>
                 </Button>
               ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
