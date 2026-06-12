import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedMiddleware } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  const authenticated = await isAuthenticatedMiddleware(request);

  if (isAdminRoute && !isLoginRoute) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect authenticated users away from login
  if (isLoginRoute && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
