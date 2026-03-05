
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing purposes (from .env.local)
const supabaseUrl = 'https://xjhcaimhtkdetirxelgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqaGNhaW1odGtkZXRpcnhlbGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzMwNTQsImV4cCI6MjA4ODI0OTA1NH0.zoIC9thQsTY3r3qYyqmjcrQ_qIH3tHpxFWmnByJd-X0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log("--- Starting Robust Supabase Test ---");

    // 1. Authenticate (Sign Up a dummy user or Sign In)
    const email = `user${Date.now()}@falidao.com`;
    const password = 'TestPassword123!';
    
    console.log(`1. Attempting to sign up user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth Error:", authError.message);
        return;
    }

    const user = authData.user;
    
    if (!user) {
        console.error("User creation failed (likely requires email confirmation if enabled, but usually returns user object).");
        // Try to sign in if user already exists (unlikely with timestamp)
        return;
    }
    console.log("User created/authenticated. ID:", user.id);

    // 2. Initial Data Load (Should be empty)
    console.log("2. Fetching initial data...");
    const { data: initData, error: initError } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', user.id)
        .single();

    if (initError) {
        if (initError.code === 'PGRST116') {
             console.log("Success: No data found as expected for new user.");
        } else {
             console.error("Error fetching initial data:", initError);
        }
    } else {
        console.log("Unexpected data found:", initData);
    }

    // 3. Insert Data (Simulate Save)
    console.log("3. Saving new data (Salary: 5000)...");
    const testPayload = { salary: 5000, expenses: [] };
    
    const { error: saveError } = await supabase
        .from('user_data')
        .upsert({ id: user.id, data: testPayload, updated_at: new Date() });

    if (saveError) {
        console.error("Error saving data:", saveError);
        return;
    }
    console.log("Data saved successfully.");

    // 4. Verify Persistence (Read back)
    console.log("4. Reading back data to verify persistence...");
    const { data: verifyData, error: verifyError } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', user.id)
        .single();

    if (verifyError) {
        console.error("Error reading back data:", verifyError);
    } else {
        console.log("Read back result:", verifyData);
        if (verifyData?.data?.salary === 5000) {
            console.log("SUCCESS: Data persistence verified! Salary is 5000.");
        } else {
            console.error("FAILURE: Salary mismatch.", verifyData?.data);
        }
    }

    // 5. Update Data (Simulate Change)
    console.log("5. Updating data (Salary: 6000)...");
    const updatePayload = { salary: 6000, expenses: [] };
    const { error: updateError } = await supabase
        .from('user_data')
        .upsert({ id: user.id, data: updatePayload, updated_at: new Date() });

    if (updateError) {
        console.error("Error updating data:", updateError);
    } else {
        console.log("Update successful.");
    }

    // 6. Final Read
    const { data: finalData } = await supabase
        .from('user_data')
        .select('data')
        .eq('id', user.id)
        .single();
    
    console.log("Final Read:", finalData);
    if (finalData?.data?.salary === 6000) {
        console.log("SUCCESS: Update verified!");
    } else {
        console.error("FAILURE: Update mismatch.");
    }

    console.log("--- Test Complete ---");
}

runTest();
