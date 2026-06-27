import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getMockClient } from './mockClient'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = supabaseUrl && 
                       supabaseAnonKey && 
                       !supabaseUrl.includes('placeholder') && 
                       !supabaseAnonKey.includes('placeholder')

  let user = null

  if (!isConfigured) {
    // Under Mock Mode, parse browser cookies to find session details
    const mockCookieStore = {
      get: (key: string) => request.cookies.get(key),
      set: (key: string, value: string, options?: any) => {
        request.cookies.set(key, value)
        supabaseResponse.cookies.set(key, value, options)
      }
    }
    const supabaseMock = getMockClient(mockCookieStore)
    const { data } = await supabaseMock.auth.getUser()
    user = data?.user
  } else {
    // Normal client session handler
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user: realUser },
    } = await supabase.auth.getUser()
    user = realUser
  }

  const pathname = request.nextUrl.pathname

  // Protected paths: /dashboard and its sub-routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  // Auth paths: login and register
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isDashboardRoute && !user) {
    // User is not logged in, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // User is logged in, redirect to dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
