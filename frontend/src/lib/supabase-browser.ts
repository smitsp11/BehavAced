/**
 * Supabase Browser Client
 * For use in CLIENT COMPONENTS ONLY
 */
import { createBrowserClient } from '@supabase/ssr'

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

// Create browser client (for client components)
export const supabaseBrowser = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton instance for convenience
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = supabaseBrowser()
  }
  return supabaseInstance
}

// Auth helper functions (for client components)
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signInWithGitHub() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const supabase = getSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const supabase = getSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

