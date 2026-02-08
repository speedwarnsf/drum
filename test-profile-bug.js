// Test script to debug profile save issue
const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY4NTAsImV4cCI6MjA2NjUzMjg1MH0.eF28qERZEnSTeVvWbswqrCo1_j4RBXMGaFx2tf8rrvc';

const supabase = createClient(url, anon);

async function testFlow() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if we can get user (should be null for new test)
  const { data: userData, error: authError } = await supabase.auth.getUser();
  console.log('Auth check:', { user: userData?.user?.id, error: authError?.message });
  
  // Test 2: Check table structure first
  console.log('Checking drum_profiles table structure...');
  const { data: tableData, error: tableError } = await supabase
    .from('drum_profiles')
    .select('*')
    .limit(1);
    
  if (tableError) {
    console.error('Table query error:', tableError.message);
  } else {
    console.log('Table exists! Sample row structure:', Object.keys(tableData[0] || {}));
  }
  
  // Test 3: Create test user
  const testEmail = `test.user.${Date.now()}@drumtest.com`;
  const testPassword = 'testpassword123';
  
  console.log('Creating test user...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (signUpError) {
    console.error('Signup error:', signUpError.message);
    return;
  }
  
  console.log('User created:', signUpData.user?.id);
  
  // Test 4: Try to insert profile (this should work if user is created)
  if (signUpData.user) {
    const testProfile = {
      user_id: signUpData.user.id,
      level: 'true_beginner',
      kit: 'roland_edrum',
      minutes: 15,
      goal: 'comfort_time',
      session_count: 0,
      current_module: 1,
      module_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Inserting test profile...');
    const { data: insertData, error: insertError } = await supabase
      .from('drum_profiles')
      .insert(testProfile);
      
    if (insertError) {
      console.error('Profile insert error:', insertError.message);
      
      // Try upsert instead
      console.log('Trying upsert...');
      const { data: upsertData, error: upsertError } = await supabase
        .from('drum_profiles')
        .upsert(testProfile);
        
      if (upsertError) {
        console.error('Profile upsert error:', upsertError.message);
      } else {
        console.log('Profile upsert success!');
      }
    } else {
      console.log('Profile insert success!');
    }
  }
}

testFlow().catch(console.error);