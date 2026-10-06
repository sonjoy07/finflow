import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/features/auth/lib/session';

// Protected path prefixes
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/transactions',
  '/reconciliation',
  '/workflows',
  '/activity',
  '/design-system',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isProtectedPath =
    pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const isLoginPage = pathname === '/login';

  // 1. If user is on /login and already has a valid session -> redirect to /dashboard
  if (isLoginPage && token) {
    try {
      await verifySession(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid/expired token -> clear it and let them log in
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  // 2. If user is accessing a protected page -> require valid session
  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/') {
        loginUrl.searchParams.set('from', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    try {
      await verifySession(token);
      return NextResponse.next();
    } catch (err) {
      const isExpired = err instanceof Error && err.message === 'EXPIRED_SESSION';
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', isExpired ? 'session_expired' : 'unauthorized');
      if (pathname !== '/') {
        loginUrl.searchParams.set('from', pathname);
      }

      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes handle their own auth per-endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
