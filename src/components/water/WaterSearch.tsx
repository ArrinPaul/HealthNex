"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface WaterSearchProps {
  onResults: (results: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function WaterSearch({ onResults, loading, setLoading }: WaterSearchProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      let lat, lng;
      if (!location) {
        lat = 14.4673;
        lng = 78.8242;
      } else if (location.includes(',')) {
        const coords = location.split(',').map(c => parseFloat(c.trim()));
        lat = coords[0];
        lng = coords[1];
      } else {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
        } else {
          throw new Error('Location not found');
        }
      }

      const response = await fetch(`/api/water-quality?lat=${lat}&lon=${lng}`);
      if (!response.ok) throw new Error('Failed to fetch water quality data');
      
      const data = await response.json();
      
      let aiAnalysis = [];
      try {
        const aiResponse = await fetch('/api/water-quality/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: location || 'Kadapa',
            coordinates: { lat, lng },
            waterQuality: data.waterQuality,
            weather: data.weather
          })
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiAnalysis = aiData.recommendations || [];
        }
      } catch {
        // AI analysis failed, continue without it
      }
      
      onResults({
        location: location || 'Kadapa',
        coordinates: { lat, lng },
        parameters: {
          ph: data.waterQuality.pH,
          turbidity: data.waterQuality.turbidity,
          temperature: Math.round(data.weather.temperature - 273.15),
          rainfall: data.weather.rainfall || 0,
          humidity: data.weather.humidity
        },
        status: data.waterQuality.riskLevel === 'High' ? 'Warning' : 'Safe',
        recommendations: aiAnalysis.length > 0 ? aiAnalysis : []
      });
      
    } catch (error) {
      console.error(error);
      alert('Failed to fetch water quality data. Please ensure the location is valid and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{t('searchLocation')}</h3>
            <p className="text-[10px] text-muted-foreground">Enter city name or GPS coordinates</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, Delhi, or 28.6139, 77.2090"
              className="h-10 bg-secondary/50 border-border/60 text-sm font-medium mt-1.5 focus:ring-primary/30"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="mt-auto h-10 px-5 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5" />
            )}
            {loading ? 'Analyzing...' : t('checkWaterQuality')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
