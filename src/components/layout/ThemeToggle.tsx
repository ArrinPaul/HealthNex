"use client";

import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useSettings();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={`w-10 h-10 rounded-xl border border-border/80 bg-secondary/50 text-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_12px_rgba(0,217,255,0.2)] transition-all ${className || ''}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </Button>
  );
}
