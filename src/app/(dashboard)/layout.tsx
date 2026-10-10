import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ToastContainer } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <div className="flex min-h-screen bg-background text-foreground antialiased">
          {/* Accessible Skip Link for Keyboard Navigation (WCAG 2.4.1) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-xs transition-all"
          >
            Skip to main content
          </a>

          {/* Desktop Collapsible Sidebar */}
          <Sidebar />

          {/* Mobile Navigation Drawer */}
          <MobileNav />

          {/* Main Application Area */}
          <div className="flex flex-1 flex-col min-w-0">
            <Topbar />
            <main
              id="main-content"
              role="main"
              className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8"
            >
              {children}
            </main>
          </div>

          {/* Global Accessible Toast Queue */}
          <ToastContainer />
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}
