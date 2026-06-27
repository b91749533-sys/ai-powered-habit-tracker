/**
 * Helper to translate raw database, auth, or browser network errors
 * into descriptive and actionable developer/user messages.
 */
export function getDescriptiveErrorMessage(err: any): string {
  if (!err) return 'An unknown error occurred.'
  
  const msg = typeof err === 'string' ? err : err.message || ''
  
  // 1. Network / DNS / Reachability errors
  if (
    msg.includes('Failed to fetch') || 
    msg.includes('fetch') || 
    msg.includes('TypeError') ||
    msg.includes('NetworkError') ||
    msg.includes('Network Error')
  ) {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return 'You are currently offline. Please check your internet connection and try again.'
    }
    return 'Connection failed: The authentication server is unreachable. Please verify that your .env.local file is configured with the correct NEXT_PUBLIC_SUPABASE_URL, and that your Supabase project instance is active (not paused).'
  }
  
  // 2. Database trigger or RLS policy errors
  if (
    msg.includes('Database error') || 
    msg.includes('database') ||
    msg.includes('trigger') ||
    msg.includes('profiles')
  ) {
    return 'Database Error: Unable to complete operation. This usually happens if the schema, Row Level Security (RLS) policies, or the trigger function (like public.handle_new_user) in your Supabase SQL Editor are misconfigured.'
  }
  
  // 3. User Credentials errors
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('invalid login')) {
    return 'Invalid login credentials. Please check your email and password and try again.'
  }
  
  // 4. Duplicate Account errors
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('duplicate key')) {
    return 'An account with this email address already exists. Please try signing in instead.'
  }

  // 5. Password length constraint
  if (msg.includes('Password should be') || msg.includes('at least 6 characters')) {
    return 'Password is too weak. It must be at least 6 characters long.'
  }
  
  return msg || 'An unexpected error occurred. Please try again.'
}
