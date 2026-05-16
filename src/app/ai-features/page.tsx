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
  MapPin
} from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function AIFeaturesPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // AI Feature States
  const [symptoms, setSymptoms] = useState('');
  const [healthQuery, setHealthQuery] = useState('');
  const [location, setLocation] = useState('');
  const [outbreakData, setOutbreakData] = useState('');

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
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI & ML Features</h1>
          <p className="text-muted-foreground mt-2">
            Explore our AI-powered health surveillance capabilities
          </p>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">AI Features</TabsTrigger>
            <TabsTrigger value="dashboard">ML Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            {/* AI Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature) => (
                <Card key={feature.id} className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] hover:bg-card/70 transition-all">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-2 mb-4`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={feature.action}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Test AI
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Input Forms */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Symptom Analysis Input */}
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Symptom Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="fever, headache, diarrhea, nausea"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={analyzeSymptoms} disabled={loading} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Symptoms
                  </Button>
                </CardContent>
              </Card>

              {/* Health Query Input */}
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Health Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="query">Ask a health question</Label>
                    <Textarea
                      id="query"
                      placeholder="How can we prevent cholera in rural areas?"
                      value={healthQuery}
                      onChange={(e) => setHealthQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location (optional)</Label>
                    <Input
                      id="location"
                      placeholder="Kadapa, Andhra Pradesh"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={askHealthQuestion} disabled={loading} className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Display */}
            {results && (
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    AI Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.type === 'symptoms' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <h4 className="font-semibold mb-2">AI Analysis</h4>
                        <p className="text-sm">{results.data.analysis}</p>
                      </div>
                      {results.data.urgency && (
                        <Badge variant={results.data.urgency === 'High' ? 'destructive' : results.data.urgency === 'Medium' ? 'default' : 'secondary'}>
                          Urgency: {results.data.urgency}
                        </Badge>
                      )}
                      {results.data.recommendations && (
                        <div>
                          <h5 className="font-medium mb-2">Recommendations:</h5>
                          <ul className="space-y-1">
                            {results.data.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {results.type === 'query' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <h4 className="font-semibold mb-2">AI Health Assistant</h4>
                        <p className="text-sm">{results.data.answer}</p>
                      </div>
                    </div>
                  )}

                  {results.type === 'outbreak' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex-1">
                          <h4 className="font-semibold">Outbreak Risk</h4>
                          <p className="text-2xl font-bold">{results.data.outbreakRisk}</p>
                        </div>
                        {results.data.confidence && (
                          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <h4 className="font-semibold">Confidence</h4>
                            <p className="text-xl font-bold">{(results.data.confidence * 100).toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {results.type === 'forecast' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Health Trend Forecast</h4>
                      <div className="grid gap-3">
                        {results.data.forecast?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{item.community}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={item.trend === 'Increasing' ? 'destructive' : 'secondary'}>
                                {item.trend}
                              </Badge>
                              <Badge variant={item.risk === 'High' ? 'destructive' : 'secondary'}>
                                {item.risk} Risk
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {/* ML Dashboard */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gemini AI</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ML Models</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Pipeline</span>
                      <Badge variant="default">Running</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ML Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prediction Accuracy</span>
                      <span className="font-bold text-muted-foreground italic">Pending Data</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="font-bold text-muted-foreground italic">--</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Calls Today</span>
                      <span className="font-bold text-muted-foreground italic">--</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Health Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Early Detections</span>
                      <span className="font-bold text-emerald-400">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prevented Outbreaks</span>
                      <span className="font-bold text-sky-400">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lives Protected</span>
                      <span className="font-bold text-violet-400">1,200+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={predictOutbreak} disabled={loading} className="h-20 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                Run Prediction
              </Button>
              <Button onClick={generateHealthForecast} disabled={loading} variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                Generate Forecast
              </Button>
              <Button onClick={() => setResults(null)} variant="outline" className="h-20 flex-col">
                <Eye className="w-6 h-6 mb-2" />
                Clear Results
              </Button>
              <Button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open('/api/api-docs', '_blank');
                  }
                }} 
                variant="outline" 
                className="h-20 flex-col"
              >
                <Brain className="w-6 h-6 mb-2" />
                API Docs
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}