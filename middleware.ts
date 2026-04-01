import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get session - try getSession first, fallback to getting user with token from cookies
  const { data: { session }, error } = await supabase.auth.getSession()

  // If no session from cookies, try to get user directly (validates token without session refresh)
  let user = session?.user ?? null
  if (!user && !error) {
    const { data: { user: validUser } } = await supabase.auth.getUser()
    user = validUser ?? null
  }

  const { pathname } = req.nextUrl

  const protectedRoutes = [
    '/dashboard',
    '/income',
    '/expenses',
    '/goals',
    '/learn',
    '/settings',
    '/market',
    '/summary',
    '/transactions',
  ]

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const guestOnlyRoutes = ['/', '/auth']
  if (guestOnlyRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/auth',
    '/dashboard/:path*',
    '/income/:path*',
    '/expenses/:path*',
    '/goals/:path*',
    '/learn/:path*',
    '/settings/:path*',
    '/market/:path*',
    '/summary/:path*',
    '/transactions/:path*',
  ],
}