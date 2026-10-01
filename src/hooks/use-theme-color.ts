'use client';

import * as React from 'react';

export interface ChartThemeColors {
  emerald: string;
  rose: string;
  amber: string;
  purple: string;
  blue: string;
  muted: string;
}

export const DEFAULT_FINTECH_CHART_COLORS: ChartThemeColors = {
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  purple: '#a855f7',
  blue: '#3b82f6',
  muted: '#64748b',
};

/**
 * Custom hook to dynamically resolve theme-aware color tokens for SVG renderers (e.g. Recharts)
 * that cannot evaluate CSS custom properties natively.
 */
export function useResolvedChartColors(): ChartThemeColors {
  const [colors, setColors] = React.useState<ChartThemeColors>(DEFAULT_FINTECH_CHART_COLORS);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setColors({
        emerald: isDark ? '#34d399' : '#10b981',
        rose: isDark ? '#fb7185' : '#f43f5e',
        amber: isDark ? '#fbbf24' : '#f59e0b',
        purple: isDark ? '#c084fc' : '#a855f7',
        blue: isDark ? '#60a5fa' : '#3b82f6',
        muted: isDark ? '#94a3b8' : '#64748b',
      });
    };

    updateColors();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateColors();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return colors;
}
