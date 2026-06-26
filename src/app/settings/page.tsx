"use client";

import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Globe, Sun, Moon, Type, Eye, Palette, Languages, Bell, Shield, Volume2, Monitor } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast, 
    language, 
    setLanguage,
    theme,
    setTheme
  } = useSettings();
  
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
              </span>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Configuration</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground mt-1">Customize your experience and accessibility preferences</p>
          </div>
        </div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Appearance</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Customize how the application looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">Theme</Label>
                  <p className="text-[11px] text-muted-foreground">Choose between light and dark mode</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className={`h-9 px-4 rounded-xl text-[11px] font-semibold transition-all ${theme === 'light' ? 'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20' : 'border-border/60 hover:bg-secondary/80'}`}
                  >
                    <Sun className="w-3.5 h-3.5 mr-1.5" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className={`h-9 px-4 rounded-xl text-[11px] font-semibold transition-all ${theme === 'dark' ? 'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20' : 'border-border/60 hover:bg-secondary/80'}`}
                  >
                    <Moon className="w-3.5 h-3.5 mr-1.5" />
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accessibility Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Accessibility</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Make the application easier to use</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('fontSize')}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Adjust text size for better readability</p>
                </div>
                <Select value={fontSize} onValueChange={(value: any) => setFontSize(value)}>
                  <SelectTrigger className="w-36 h-9 bg-secondary/50 border-border/60 text-sm font-medium rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="highContrast" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('contrast')}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="highContrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">{t('language')}</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Choose your preferred language</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">Interface Language</Label>
                  <p className="text-[11px] text-muted-foreground">Select the language for the entire interface</p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-52 h-9 bg-secondary/50 border-border/60 text-sm font-medium rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <span>🇺🇸</span> English
                      </div>
                    </SelectItem>
                    <SelectItem value="hi">
                      <div className="flex items-center gap-2">
                        <span>🇮🇳</span> हिन्दी (Hindi)
                      </div>
                    </SelectItem>
                    <SelectItem value="bn">
                      <div className="flex items-center gap-2">
                        <span>🇧🇩</span> বাংলা (Bengali)
                      </div>
                    </SelectItem>
                    <SelectItem value="as">
                      <div className="flex items-center gap-2">
                        <span>🇮🇳</span> অসমীয়া (Assamese)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Notifications</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Manage how you receive alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/50 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">Disease Outbreak Alerts</Label>
                  <p className="text-[11px] text-muted-foreground">Get notified about predicted outbreaks</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/50 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">Water Quality Warnings</Label>
                  <p className="text-[11px] text-muted-foreground">Receive alerts about water contamination</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/50 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">Health Tips & Education</Label>
                  <p className="text-[11px] text-muted-foreground">Get periodic health awareness messages</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Security</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">Manage your account security settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/50 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">Two-Factor Authentication</Label>
                  <p className="text-[11px] text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/50 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">Email Notifications</Label>
                  <p className="text-[11px] text-muted-foreground">Receive security alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
