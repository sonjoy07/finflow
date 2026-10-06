import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-4xl font-bold font-mono text-primary">404</span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          The requested operations view or resource could not be found. Please verify the URL or return to the overview.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
