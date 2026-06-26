"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

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
        lat = 14.4673; // Kadapa default
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
      
      // Get AI analysis
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
      // No longer using mock fallback.
      alert('Failed to fetch water quality data. Please ensure the location is valid and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <CardTitle>{t('searchLocation')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="location">Location Name or GPS Coordinates</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name or coordinates (lat, lng)"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="mt-auto">
            <MapPin className="w-4 h-4 mr-2" />
            {loading ? t('loading') : t('checkWaterQuality')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
