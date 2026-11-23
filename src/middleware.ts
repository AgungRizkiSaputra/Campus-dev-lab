import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Protected paths check
  const isDashboardRoute = path.startsWith('/buyer') || path.startsWith('/seller') || path.startsWith('/admin');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // If user is accessing protected dashboard without session
  // (In local dev / test mock mode, we allow bypass if dummy token exists or in development mode)
  if (isDashboardRoute && !user && process.env.NODE_ENV === 'production') {
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // If logged in user accesses login/register, redirect to dashboard
  if (isAuthRoute && user) {
    const role = (user.user_metadata?.role as string) || 'buyer';
    url.pathname = `/${role}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/buyer/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
