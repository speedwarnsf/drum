// Test the fixed profile save functionality
const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY4NTAsImV4cCI6MjA2NjUzMjg1MH0.eF28qERZEnSTeVvWbswqrCo1_j4RBXMGaFx2tf8rrvc';

const supabase = createClient(url, anon);

async function testFixedProfileSave() {
  console.log('Testing the fixed profile save functionality...');
  
  // Create a new test user
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
  
  // Simulate the profile save logic with graceful fallback
  if (signUpData.user) {
    const user = signUpData.user;
    
    // First try to get existing profile with module columns (this will fail gracefully)
    let existing = null;
    let hasModuleColumns = true;
    
    try {
      const { data: fullProfile, error: fullError } = await supabase
        .from('drum_profiles')
        .select('session_count, current_module, module_started_at')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (fullError && (fullError.message.includes('current_module') || (fullError.message.includes('column') && fullError.message.includes('does not exist')))) {
        console.warn('[Drum] Module columns missing from drum_profiles table, using basic columns only');
        hasModuleColumns = false;
      } else if (fullError) {
        console.error('[Drum] Error fetching existing profile:', fullError.message);
      } else {
        existing = fullProfile;
      }
    } catch (err) {
      console.warn('[Drum] Failed to fetch full profile, falling back to basic columns');
      hasModuleColumns = false;
    }
    
    // If module columns don't exist, try with basic columns only
    if (!hasModuleColumns) {
      const { data: basicProfile, error: basicError } = await supabase
        .from('drum_profiles')
        .select('session_count')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (basicError) {
        console.error('[Drum] Error fetching basic profile:', basicError.message);
      } else {
        existing = basicProfile;
      }
    }
    
    // Prepare profile data
    const profileData = {
      user_id: user.id,
      level: 'true_beginner',
      kit: 'roland_edrum',
      minutes: 15,
      goal: 'comfort_time',
      session_count: 0,
      updated_at: new Date().toISOString(),
    };
    
    // Only add module columns if they exist
    if (hasModuleColumns) {
      profileData.current_module = 1;
      profileData.module_started_at = new Date().toISOString();
    }
    
    console.log('Upserting profile with data:', profileData);
    console.log('Has module columns:', hasModuleColumns);
    
    const { error: upsertError } = await supabase
      .from('drum_profiles')
      .upsert(profileData);
    
    if (upsertError) {
      console.error('[Drum] Profile upsert error:', upsertError.message);
    } else {
      console.log('[Drum] Profile saved successfully!');
      
      // Verify the save
      const { data: savedProfile, error: verifyError } = await supabase
        .from('drum_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (verifyError) {
        console.error('Verification error:', verifyError.message);
      } else {
        console.log('Saved profile:', savedProfile);
      }
    }
  }
}

testFixedProfileSave().catch(console.error);