"use client";

import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme } = useSettings();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="w-12 h-12 rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] text-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_20px_rgba(0,217,255,0.35)] theme-transition"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6" />
      ) : (
        <Sun className="w-6 h-6" />
      )}
    </Button>
  );
}
