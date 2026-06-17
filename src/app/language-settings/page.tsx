"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Languages, Volume2, Globe, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/contexts/SettingsContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', status: 'supported' as const },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', status: 'supported' as const },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', status: 'beta' as const },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', status: 'beta' as const },
];

export default function LanguageSettingsPage() {
  const { language, setLanguage } = useSettings();
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1.0, pitch: 1.0, volume: 1.0 });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const handleVoiceSettingChange = (setting: 'rate' | 'pitch' | 'volume', value: number) => {
    setVoiceSettings(prev => ({ ...prev, [setting]: value }));
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Hello, this is a voice test.');
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      speechSynthesis.speak(utterance);
    }
    setIsTestingVoice(true);
    setTimeout(() => setIsTestingVoice(false), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Languages className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Language Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your language and voice preferences</p>
          </div>
        </div>

        {/* Language Selection */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    language === lang.code
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-secondary border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                  {lang.status === 'beta' && (
                    <Badge variant="outline" className="text-[10px] shrink-0">Beta</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="w-4 h-4" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-voice" className="text-sm">Enable Voice</Label>
              <Switch id="enable-voice" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            {voiceEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-speak" className="text-sm">Auto Speak</Label>
                  <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Rate: {voiceSettings.rate.toFixed(1)}x</Label>
                    <Slider
                      value={[voiceSettings.rate]}
                      onValueChange={(v) => handleVoiceSettingChange('rate', v[0])}
                      min={0.5} max={2} step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Pitch: {voiceSettings.pitch.toFixed(1)}</Label>
                    <Slider
                      value={[voiceSettings.pitch]}
                      onValueChange={(v) => handleVoiceSettingChange('pitch', v[0])}
                      min={0.5} max={2} step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Volume: {Math.round(voiceSettings.volume * 100)}%</Label>
                    <Slider
                      value={[voiceSettings.volume]}
                      onValueChange={(v) => handleVoiceSettingChange('volume', v[0])}
                      min={0.1} max={1} step={0.1}
                    />
                  </div>
                </div>

                <Button onClick={testVoice} disabled={isTestingVoice} size="sm" className="mt-2">
                  {isTestingVoice ? 'Playing...' : 'Test Voice'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reset */}
        <Card className="bg-card border border-border">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">Reset all language settings to defaults</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLanguage('en');
                setVoiceSettings({ rate: 1.0, pitch: 1.0, volume: 1.0 });
              }}
            >
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
