import { createBrowserClient } from '@supabase/ssr'
import { getMockClient } from './mockClient'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = supabaseUrl && 
                       supabaseAnonKey && 
                       !supabaseUrl.includes('placeholder') && 
                       !supabaseAnonKey.includes('placeholder')

  if (!isConfigured) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase configuration is not loaded in .env.local. Bootstrapping interactive local mock data layer.')
    }
    return getMockClient() as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
