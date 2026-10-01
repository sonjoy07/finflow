'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Moon className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Tooltip content={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`} side="bottom">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200" aria-hidden="true" />
        )}
      </Button>
    </Tooltip>
  );
}
