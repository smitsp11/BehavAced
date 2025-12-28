import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Use server client with cookies for PKCE code verifier
    const supabase = supabaseServer()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Session should be set in cookies by Supabase
    // Redirect to onboarding - the client-side AuthProvider will pick up the session
    if (data.session) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // If no code or session exchange failed, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_session`)
}

