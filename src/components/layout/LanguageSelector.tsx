"use client";

import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Volume2, 
  VolumeX, 
  Check,
  Globe,
  Mic,
  MicOff,
  Settings
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceSupported: boolean;
  region: string;
}

interface VoiceSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

const LanguageSelector: React.FC = () => {
  // const { i18n, t } = useTranslation(); // Removed for SSR compatibility
  const t = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const i18n = { language: 'en', changeLanguage: (lang: string) => Promise.resolve() }; // Mock i18n
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoSpeak: false
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const supportedLanguages: Language[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      voiceSupported: true,
      region: 'Global'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '��',
      voiceSupported: true,
      region: 'India/Bangladesh'
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'gu',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      flag: '��',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'pa',
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'or',
      name: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'as',
      name: 'Assamese',
      nativeName: 'অসমীয়া',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India'
    },
    {
      code: 'ur',
      name: 'Urdu',
      nativeName: 'اردو',
      flag: '🇮🇳',
      voiceSupported: true,
      region: 'India/Pakistan'
    },
    {
      code: 'gom',
      name: 'Konkani',
      nativeName: 'कोंकणी',
      flag: '🇮🇳',
      voiceSupported: false,
      region: 'India'
    },
    {
      code: 'ne',
      name: 'Nepali',
      nativeName: 'नेपाली',
      flag: '🇳🇵',
      voiceSupported: true,
      region: 'Nepal/India'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      voiceSupported: true,
      region: 'SA'
    },
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      voiceSupported: true,
      region: 'CN'
    }
  ];

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') return;
    
    // Load saved language and voice settings
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedVoiceSettings = localStorage.getItem('voiceSettings');
    
    if (savedLanguage && supportedLanguages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
    
    if (savedVoiceSettings) {
      try {
        setVoiceSettings(JSON.parse(savedVoiceSettings));
      } catch (error) {
        console.error('Error parsing voice settings:', error);
      }
    }

    // Load available voices
    loadAvailableVoices();
  }, [i18n]);

  const loadAvailableVoices = () => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      
      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredLanguage', languageCode);
      }
      
      // Announce language change if voice is enabled
      if (voiceSettings.enabled) {
        const selectedLang = supportedLanguages.find(lang => lang.code === languageCode);
        if (selectedLang) {
          setTimeout(() => {
            speakText(`Language changed to ${selectedLang.name}`, languageCode);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...voiceSettings, ...newSettings };
    setVoiceSettings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voiceSettings', JSON.stringify(updated));
    }
  };

  const speakText = (text: string, language?: string) => {
    if (typeof window === 'undefined' || !voiceSettings.enabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = language || currentLanguage;
    
    // Find best matching voice
    const preferredVoice = availableVoices.find(voice => 
      voice.lang.startsWith(langCode) || voice.lang.startsWith(langCode.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    window.speechSynthesis.speak(utterance);
  };

  const testVoice = () => {
    const selectedLang = supportedLanguages.find(lang => lang.code === currentLanguage);
    const testText = t('voiceTestMessage') || `Hello, this is a voice test in ${selectedLang?.name}`;
    speakText(testText, currentLanguage);
  };

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  const getVoiceSupport = (languageCode: string) => {
    const hasVoices = availableVoices.some(voice => 
      voice.lang.startsWith(languageCode) || voice.lang.startsWith(languageCode.split('-')[0])
    );
    return hasVoices;
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 min-w-[120px]"
          >
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLang.flag}</span>
            <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
            {voiceSettings.enabled && getVoiceSupport(currentLanguage) && (
              <Volume2 className="w-3 h-3 text-green-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t('selectLanguage') || 'Select Language'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {supportedLanguages.map((language) => {
            const isSelected = language.code === currentLanguage;
            const hasVoiceSupport = getVoiceSupport(language.code);
            
            return (
              <DropdownMenuItem
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{language.name}</span>
                      {hasVoiceSupport && (
                        <Volume2 className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{language.nativeName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isSelected && <Check className="w-4 h-4 text-green-500" />}
                  <Badge variant={hasVoiceSupport ? "default" : "secondary"} className="text-xs">
                    {language.code.toUpperCase()}
                  </Badge>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('voiceSettings') || 'Voice Settings'}
          </DropdownMenuLabel>
          
          <DropdownMenuCheckboxItem
            checked={voiceSettings.enabled}
            onCheckedChange={(checked) => updateVoiceSettings({ enabled: checked })}
            className="flex items-center gap-2"
          >
            {voiceSettings.enabled ? (
              <Volume2 className="w-4 h-4 text-green-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            {t('enableVoice') || 'Enable Voice'}
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={voiceSettings.autoSpeak}
            onCheckedChange={(checked) => updateVoiceSettings({ autoSpeak: checked })}
            disabled={!voiceSettings.enabled}
          >
            <Mic className="w-4 h-4 text-blue-500" />
            {t('autoSpeak') || 'Auto-speak responses'}
          </DropdownMenuCheckboxItem>
          
          {voiceSettings.enabled && (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('speechRate') || 'Speech Rate'}: {voiceSettings.rate.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voiceSettings.rate}
                      onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('speechPitch') || 'Speech Pitch'}: {voiceSettings.pitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voiceSettings.pitch}
                      onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('volume') || 'Volume'}: {Math.round(voiceSettings.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={voiceSettings.volume}
                      onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <Button
                    onClick={testVoice}
                    size="sm"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {t('testVoice') || 'Test Voice'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;