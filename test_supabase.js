
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log("Testing Supabase connection...");

    // 1. Check if we can connect and list tables (might be restricted, but let's try reading user_data)
    // We'll try to sign in anonymously or just use the anon key.
    // Since we need a user for RLS usually, this might fail if we don't have a session.
    // However, the app uses RLS. 
    
    // Let's try to just check if the table exists by selecting 1 row (it might return empty or error)
    const { data, error } = await supabase
        .from('user_data')
        .select('id')
        .limit(1);

    if (error) {
        console.error("Error connecting/reading:", error);
    } else {
        console.log("Connection successful. Data read:", data);
    }
}

testSupabase();
