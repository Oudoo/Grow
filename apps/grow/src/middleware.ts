import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedMiddleware } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === '/admin/login';

  // Protected surfaces: the Admin OS, the recruiter module, and its API.
  // The marketing site (/, /services, /about, …) stays public.
  const isProtected =
    (pathname.startsWith('/admin') && !isLoginRoute) ||
    pathname.startsWith('/producer') ||
    pathname.startsWith('/api/producer');

  const authenticated = await isAuthenticatedMiddleware(request);

  if (isProtected && !authenticated) {
    // API → 401 JSON; pages → redirect to the staff login.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (isLoginRoute && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/producer/:path*', '/api/producer/:path*'],
};
