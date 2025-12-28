import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to onboarding for new users (they'll need to complete onboarding)
  // We can check if they have a profile later, but for now redirect to onboarding
  return NextResponse.redirect(`${origin}/onboarding`)
}

