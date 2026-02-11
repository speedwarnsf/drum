// Test with existing user profile
const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1Njg1MCwiZXhwIjoyMDY2NTMyODUwfQ.3k5UI5onZyHvD9aSxV68wz2laDkv3GskKWKg_CgWdCw';

const supabase = createClient(url, serviceKey);

async function testWithExistingUser() {
  console.log('Testing profile save with existing user...');
  
  // Get an existing user
  const { data: profilesData, error: profilesError } = await supabase
    .from('drum_profiles')
    .select('*')
    .limit(1);
    
  if (profilesError) {
    console.error('Error getting profiles:', profilesError.message);
    return;
  }
  
  if (profilesData.length === 0) {
    console.log('No existing profiles found');
    return;
  }
  
  const existingProfile = profilesData[0];
  const userId = existingProfile.user_id;
  
  console.log('Using existing user:', userId);
  console.log('Current profile:', existingProfile);
  
  // Test the graceful column detection logic
  let hasModuleColumns = true;
  
  try {
    const { data: fullProfile, error: fullError } = await supabase
      .from('drum_profiles')
      .select('session_count, current_module, module_started_at')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fullError && (fullError.message.includes('current_module') || (fullError.message.includes('column') && fullError.message.includes('does not exist')))) {
      console.warn('[Test] Module columns missing from drum_profiles table, using basic columns only');
      hasModuleColumns = false;
    } else if (fullError) {
      console.error('[Test] Error fetching existing profile:', fullError.message);
    } else {
      console.log('[Test] Full profile fetch successful:', fullProfile);
    }
  } catch (err) {
    console.warn('[Test] Failed to fetch full profile, falling back to basic columns');
    hasModuleColumns = false;
  }
  
  console.log('Has module columns:', hasModuleColumns);
  
  // Test updating the profile
  const profileData = {
    user_id: userId,
    level: 'beginner',
    kit: 'acoustic',
    minutes: 20,
    goal: 'basic_grooves',
    session_count: existingProfile.session_count + 1,
    updated_at: new Date().toISOString(),
  };
  
  // Only add module columns if they exist
  if (hasModuleColumns) {
    profileData.current_module = 2;
    profileData.module_started_at = new Date().toISOString();
  }
  
  console.log('Testing profile update with data:', profileData);
  
  const { error: upsertError } = await supabase
    .from('drum_profiles')
    .upsert(profileData);
  
  if (upsertError) {
    console.error('[Test] Profile upsert error:', upsertError.message);
  } else {
    console.log('[Test] Profile updated successfully!');
    
    // Verify the update
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('drum_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (verifyError) {
      console.error('Verification error:', verifyError.message);
    } else {
      console.log('Updated profile:', updatedProfile);
    }
  }
}

testWithExistingUser().catch(console.error);