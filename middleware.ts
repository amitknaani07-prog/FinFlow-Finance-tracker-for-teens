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
  let { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      session = { user, expires_at: Date.now() + 3600000 } as any
    }
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

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const guestOnlyRoutes = ['/', '/auth']
  if (guestOnlyRoutes.includes(pathname) && session) {
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