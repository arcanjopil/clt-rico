import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to create client only when needed or with fallback for build time
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build if vars are missing
    if (typeof window === 'undefined') {
        return {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                getUser: () => Promise.resolve({ data: { user: null } }),
            },
            from: () => ({
                select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
            })
        }
    }
    throw new Error('Supabase URL and Key are required!')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = createSupabaseClient()
