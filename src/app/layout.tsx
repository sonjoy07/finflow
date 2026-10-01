import type { Metadata } from 'next';
import './globals.css';
import { WebVitals } from './web-vitals';

export const metadata: Metadata = {
  title: 'FinFlow | Fintech Operations Automation',
  description:
    'Enterprise fintech operations automation platform for real-time transaction monitoring, failure triage, and ledger reconciliation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
