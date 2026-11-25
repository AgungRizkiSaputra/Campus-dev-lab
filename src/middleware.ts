import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. Read authenticated session from secure cookie
  const sessionCookie = request.cookies.get('joki_auth_session')?.value;
  let user: { role?: string; email?: string; name?: string } | null = null;

  if (sessionCookie) {
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      // Invalid/tampered cookie
      user = null;
    }
  }

  const isDashboardRoute =
    path.startsWith('/buyer') ||
    path.startsWith('/seller') ||
    path.startsWith('/admin') ||
    path.startsWith('/profile');

  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // 2. Unauthenticated Barrier:
  // Anyone accessing any dashboard route without an active session is forced to login
  if (isDashboardRoute && (!user || !user.role)) {
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 3. Strict Role-Based Access Control (RBAC):
  if (user && user.role) {
    // PROTECT ADMIN ROUTE: Only role === 'admin' can enter /admin
    if (path.startsWith('/admin') && user.role !== 'admin') {
      url.pathname = `/${user.role}`;
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }

    // PROTECT SELLER ROUTE: Only seller (or admin) can enter /seller
    if (path.startsWith('/seller') && user.role !== 'seller' && user.role !== 'admin') {
      url.pathname = `/${user.role}`;
      url.searchParams.set('error', 'unauthorized_seller');
      return NextResponse.redirect(url);
    }

    // PROTECT BUYER ROUTE: Only buyer (or admin) can enter /buyer
    if (path.startsWith('/buyer') && user.role !== 'buyer' && user.role !== 'admin') {
      // If a seller is trying to view milestones, redirect to the seller task workstation
      const projectMilestonesMatch = path.match(/^\/buyer\/projects\/([^/]+)\/milestones/);
      if (projectMilestonesMatch && user.role === 'seller') {
        url.pathname = `/seller/tasks/${projectMilestonesMatch[1]}`;
        return NextResponse.redirect(url);
      }
      url.pathname = `/${user.role}`;
      return NextResponse.redirect(url);
    }

    // If logged-in user visits login or register, redirect to their proper dashboard
    if (isAuthRoute) {
      url.pathname = `/${user.role}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/buyer/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
