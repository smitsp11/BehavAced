/**
 * Supabase Server Client
 * For use in SERVER COMPONENTS and ROUTE HANDLERS ONLY
 * 
 * ⚠️ NEVER import this into a client component
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables!\n\n' +
    'Please add to frontend/.env.local:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'Get these from: https://supabase.com/dashboard/project/_/settings/api'
  )
}

// Create server client (for server components and API routes)
export const supabaseServer = () => {
  const cookieStore = cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

