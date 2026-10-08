'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true'
    ) {
      const metricData = {
        name: metric.name,
        value: Math.round(metric.value * 100) / 100,
        rating: metric.rating,
        delta: Math.round(metric.delta * 100) / 100,
        id: metric.id,
        navigationType: metric.navigationType,
      };

      // Formatted structured telemetry logging
      console.info('[FinFlow Web Vital]', metricData);

      // Telemetry beacon dispatcher if endpoint configured
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.sendBeacon === 'function' &&
        process.env.NEXT_PUBLIC_ANALYTICS_URL
      ) {
        navigator.sendBeacon(
          process.env.NEXT_PUBLIC_ANALYTICS_URL,
          JSON.stringify(metricData)
        );
      }
    }
  });

  return null;
}
