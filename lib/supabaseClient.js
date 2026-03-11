import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to create client only when needed or with fallback for build time
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // If we're missing variables, log it but don't crash
    console.error('Missing Supabase environment variables:', { 
      url: supabaseUrl ? 'Set' : 'Missing', 
      key: supabaseKey ? 'Set' : 'Missing' 
    });

    // Return a dummy client that warns when used but doesn't crash the app
    const dummyClient = {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getUser: () => Promise.resolve({ data: { user: null } }),
            signUp: () => Promise.reject(new Error("Supabase not configured")),
            signInWithPassword: () => Promise.reject(new Error("Supabase not configured")),
            signOut: () => Promise.resolve()
        },
        from: () => ({
            select: () => ({ 
                eq: () => ({ 
                    maybeSingle: () => Promise.resolve({ data: null, error: null }),
                    single: () => Promise.resolve({ data: null, error: null })
                }),
                upsert: () => Promise.resolve({ error: null })
            }),
            insert: () => Promise.resolve({ error: null }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            upsert: () => Promise.resolve({ error: null })
        })
    };
    
    return dummyClient;
  }
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = createSupabaseClient()
