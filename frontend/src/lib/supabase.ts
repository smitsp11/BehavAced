/**
 * Supabase Client Configuration
 * 
 * ⚠️ DEPRECATED: This file is kept for backwards compatibility.
 * Please use:
 * - @/lib/supabase-browser for client components
 * - @/lib/supabase-server for server components/route handlers
 */

// Re-export browser functions for backwards compatibility
export {
  supabaseBrowser,
  getSupabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGitHub,
  signOut,
  getSession,
  getUser,
} from './supabase-browser'

// Legacy exports
import { supabaseBrowser as createBrowserClient } from './supabase-browser'

export function createClient() {
  return createBrowserClient()
}
