"use client";

import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';

export default function ThemeToggle() {
  const { theme, setTheme } = useSettings();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="rounded-full w-10 h-10 hover:bg-accent transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-foreground" />
      )}
    </Button>
  );
}