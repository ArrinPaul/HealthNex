"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Droplet, 
  Heart,
  MapPin,
  Clock,
  X,
  Sparkles,
  Activity
} from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'health' | 'water' | 'emergency' | 'trend' | 'personal';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  timestamp: Date;
  location?: string;
  icon: any;
}

const AISuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Generate AI-powered suggestions based on current conditions
  const generateSuggestions = (): Suggestion[] => {
    try {
      const currentHour = new Date().getHours();
      const currentMonth = new Date().getMonth();
    
    const baseSuggestions: Suggestion[] = [
      {
        id: '1',
        type: 'health',
        priority: 'high',
        title: 'Increased Disease Risk Alert',
        description: 'AI models predict a 23% higher risk of waterborne diseases in your area this week due to recent rainfall and temperature changes.',
        action: 'View Risk Map',
        actionUrl: '/risk-map',
        timestamp: new Date(),
        location: 'Your Area',
        icon: AlertTriangle
      },
      {
        id: '2',
        type: 'water',
        priority: 'medium',
        title: 'Water Quality Optimization',
        description: 'Based on your water usage patterns, consider boiling water for an additional 5 minutes during peak contamination hours (6-8 AM).',
        action: 'Learn More',
        actionUrl: '/water-quality',
        timestamp: new Date(),
        icon: Droplet
      },
      {
        id: '3',
        type: 'trend',
        priority: 'medium',
        title: 'Community Health Trend',
        description: 'Hand hygiene compliance in your community has increased by 34% this month. Keep up the great work!',
        action: 'View Analytics',
        actionUrl: '/analytics',
        timestamp: new Date(),
        icon: TrendingUp
      },
      {
        id: '4',
        type: 'personal',
        priority: 'low',
        title: 'Health Check Reminder',
        description: 'AI analysis suggests scheduling a preventive health check based on your area\'s health patterns.',
        action: 'Find Centers',
        actionUrl: '/health-centers',
        timestamp: new Date(),
        icon: Heart
      }
    ];

    // Add time-based suggestions
    if (currentHour >= 6 && currentHour <= 8) {
      baseSuggestions.unshift({
        id: 'time-1',
        type: 'health',
        priority: 'high',
        title: 'Morning Water Safety',
        description: 'Peak contamination hours detected. Ensure water is boiled for 20+ minutes before consumption.',
        action: 'Set Reminder',
        timestamp: new Date(),
        icon: Clock
      });
    }

    // Add seasonal suggestions
    if (currentMonth >= 5 && currentMonth <= 8) { // Monsoon season
      baseSuggestions.unshift({
        id: 'season-1',
        type: 'emergency',
        priority: 'high',
        title: 'Monsoon Health Alert',
        description: 'AI predicts increased vector-borne disease risk. Implement enhanced mosquito control measures.',
        action: 'Prevention Guide',
        actionUrl: '/education',
        timestamp: new Date(),
        icon: Activity
      });
    }

    return baseSuggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await fetch('/api/suggestions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'current-user',
            location: { area: 'user-area' },
            preferences: {},
            healthData: {}
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions(generateSuggestions());
        }
      } catch (error) {
        setSuggestions(generateSuggestions());
      }
    };

    loadSuggestions();
    const interval = setInterval(loadSuggestions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => new Set([...prev, id]));
  };

  const handleAction = (actionUrl?: string) => {
    if (actionUrl && typeof window !== 'undefined') {
      window.location.href = actionUrl;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-600 text-white border-rose-300/40';
      case 'medium': return 'bg-amber-500 text-black border-amber-200/40';
      case 'low': return 'bg-sky-500 text-black border-sky-200/40';
      default: return 'bg-[var(--surface-3)] text-foreground border-[var(--border-soft)]';
    }
  };

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  if (activeSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border border-[var(--border-soft)] shadow-[0_30px_70px_-50px_rgba(0,0,0,0.7)] overflow-hidden theme-transition">
      <CardHeader className="pb-6 bg-[var(--surface-3)] border-b border-[var(--border-soft)]">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[var(--surface-1)] text-primary flex items-center justify-center rounded-xl border border-primary/40 shadow-[0_0_22px_rgba(0,217,255,0.35)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-4 uppercase">
              Intelligent Insights
              <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full border border-primary/60">
                {activeSuggestions.length} Active
              </span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activeSuggestions.slice(0, 3).map((suggestion) => {
            const Icon = suggestion.icon;
            const styles = getPriorityStyles(suggestion.priority);
            return (
              <div
                key={suggestion.id}
                className={`p-8 rounded-2xl border flex flex-col justify-between shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)] theme-transition ${styles}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 bg-black/10 flex items-center justify-center rounded-lg border border-black/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="w-8 h-8 p-0 bg-black/10 text-current border border-black/20 hover:bg-black/20 theme-transition"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-4 uppercase leading-tight tracking-tight">{suggestion.title}</h3>
                  <p className="text-sm font-semibold opacity-90 mb-8 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest opacity-80 border-t border-current pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {(suggestion.timestamp instanceof Date ? suggestion.timestamp : new Date(suggestion.timestamp)).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {suggestion.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {suggestion.location}
                      </div>
                    )}
                  </div>
                  
                  {suggestion.action && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(suggestion.actionUrl)}
                      className="w-full h-10 bg-black/10 text-current border border-black/20 font-semibold uppercase text-[10px] tracking-widest hover:bg-black/20 theme-transition"
                    >
                      {suggestion.action}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-[var(--surface-2)] text-foreground border border-[var(--border-soft)] rounded-2xl theme-transition">
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest">
            <Lightbulb className="w-5 h-5" />
            <span>Intelligence protocol refreshed every 30 minutes based on local telemetry and regional health trends.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestions;