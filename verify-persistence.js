const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables manually
const envPath = path.resolve(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found!");
    process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase credentials missing in .env.local");
    process.exit(1);
}

console.log("✅ Environment loaded.");
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 10)}...`);

// 2. Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function verifyPersistence() {
    console.log("\n🚀 Starting Persistence Verification...");

    // 3. Authenticate (Sign In or Sign Up a test user)
    // Use a very standard looking email
    const randomId = Math.floor(Math.random() * 10000);
    const email = `test.user.${randomId}@gmail.com`;
    const password = 'StrongPassword123!';
    
    console.log(`\n🔑 Authenticating as temporary user: ${email}`);
    
    // Attempt Sign Up
    let { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error("❌ Authentication failed:", authError.message);
        console.log("⚠️ If you are rate limited, please wait a moment or try with an existing user.");
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("❌ User ID not returned after signup.");
        return;
    }
    console.log(`✅ Authenticated! User ID: ${userId}`);

    // 4. Simulate LOAD (Initial check - should be empty)
    console.log("\n📥 [LOAD 1] Fetching user data...");
    let { data: profile, error: loadError } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', userId)
        .single();

    if (loadError && loadError.code === 'PGRST116') {
        console.log("✅ [LOAD 1] No data found (Expected for new user).");
    } else if (loadError) {
        console.error("❌ [LOAD 1] Error:", loadError.message);
    } else {
        console.log("⚠️ [LOAD 1] Unexpected data found:", profile);
    }

    // 5. Simulate SAVE (Create initial data)
    console.log("\n💾 [SAVE] Saving initial data...");
    const testData = {
        salary: 5000,
        expenses: [{ id: 1, description: "Test Expense", amount: 100 }],
        timestamp: new Date().toISOString()
    };

    const { error: saveError } = await supabase
        .from('user_data')
        .upsert({ id: userId, data: testData, updated_at: new Date() });

    if (saveError) {
        console.error("❌ [SAVE] Error saving data:", saveError.message);
        return;
    }
    console.log("✅ [SAVE] Data saved successfully.");

    // 6. Simulate LOAD (Verify persistence)
    console.log("\n📥 [LOAD 2] Fetching data again to verify...");
    const { data: profile2, error: loadError2 } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', userId)
        .single();

    if (loadError2) {
        console.error("❌ [LOAD 2] Error:", loadError2.message);
        return;
    }

    if (profile2 && profile2.data && profile2.data.salary === 5000) {
        console.log("✅ [LOAD 2] Verification SUCCESS! Data matches.");
        console.log("   Salary:", profile2.data.salary);
        console.log("   Expenses:", profile2.data.expenses.length);
    } else {
        console.error("❌ [LOAD 2] Verification FAILED. Data mismatch.");
        console.log("   Received:", profile2);
    }

    console.log("\n🎉 Verification Completed.");
}

verifyPersistence();
