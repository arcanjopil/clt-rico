
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjhcaimhtkdetirxelgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqaGNhaW1odGtkZXRpcnhlbGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzMwNTQsImV4cCI6MjA4ODI0OTA1NH0.zoIC9thQsTY3r3qYyqmjcrQ_qIH3tHpxFWmnByJd-X0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('user_data').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error connecting to user_data:', error.message);
    } else {
      console.log('Successfully connected to user_data table. Count:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
