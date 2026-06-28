import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { can, defaultLanding, moduleForPath, type ModuleKey } from '@/lib/access';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === '/admin/login';

  // Protected surfaces: the Admin OS, the engine + producer modules, and their
  // APIs. The marketing site (/, /services, /about, …) stays public.
  const isProtected =
    !isLoginRoute &&
    (pathname.startsWith('/admin') ||
      pathname.startsWith('/producer') ||
      pathname.startsWith('/engine') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/api/producer') ||
      pathname.startsWith('/api/engine'));

  const session = await getSessionFromRequest(request);
  const isApi = pathname.startsWith('/api/');

  // Already signed in but visiting the login page → bounce to their landing.
  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL(defaultLanding(session.role, session.access), request.url));
  }

  if (!isProtected) return NextResponse.next();

  // Not authenticated → API 401, pages redirect to login.
  if (!session) {
    if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → enforce per-module access for this path.
  let moduleKey: ModuleKey | null = moduleForPath(pathname);
  if (pathname.startsWith('/api/producer')) moduleKey = 'producer';
  else if (pathname.startsWith('/api/engine')) moduleKey = 'engine';

  if (moduleKey && !can(session.role, session.access, moduleKey, 'view')) {
    if (isApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // Send them somewhere they can actually go.
    const landing = defaultLanding(session.role, session.access);
    const target = landing === pathname ? '/admin/login' : landing;
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/producer/:path*',
    '/engine/:path*',
    '/portal/:path*',
    '/api/producer/:path*',
    '/api/engine/:path*',
  ],
};
