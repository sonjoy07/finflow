'use client';

import * as React from 'react';
import { useUIStore } from '@/stores/ui-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useUIStore((s) => s.setTheme);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('finflow-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark mode for enterprise fintech high-density aesthetics
      setTheme('dark');
    }
  }, [setTheme]);

  return <>{children}</>;
}
