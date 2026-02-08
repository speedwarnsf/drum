const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1Njg1MCwiZXhwIjoyMDY2NTMyODUwfQ.3k5UI5onZyHvD9aSxV68wz2laDkv3GskKWKg_CgWdCw';

const supabase = createClient(url, serviceKey);

async function checkTables() {
  console.log('Checking table structures...');
  
  // Check drum_profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('drum_profiles')
    .select('*')
    .limit(1);
    
  if (profilesError) {
    console.error('drum_profiles error:', profilesError.message);
  } else {
    console.log('drum_profiles columns:', Object.keys(profiles[0] || {}));
  }
  
  // Check if there are any rows
  const { data: profileRows, error: profileRowsError } = await supabase
    .from('drum_profiles')
    .select('*');
    
  if (profileRowsError) {
    console.error('drum_profiles rows error:', profileRowsError.message);
  } else {
    console.log(`drum_profiles has ${profileRows.length} rows`);
    if (profileRows.length > 0) {
      console.log('Sample row:', profileRows[0]);
    }
  }
  
  // Check drum_sessions table
  const { data: sessions, error: sessionsError } = await supabase
    .from('drum_sessions')
    .select('*')
    .limit(1);
    
  if (sessionsError) {
    console.error('drum_sessions error:', sessionsError.message);
  } else {
    console.log('drum_sessions columns:', Object.keys(sessions[0] || {}));
  }
  
  // Check drum_entitlements table
  const { data: entitlements, error: entitlementsError } = await supabase
    .from('drum_entitlements')
    .select('*')
    .limit(1);
    
  if (entitlementsError) {
    console.error('drum_entitlements error:', entitlementsError.message);
  } else {
    console.log('drum_entitlements columns:', Object.keys(entitlements[0] || {}));
  }
  
  // Check drum_purchases table
  const { data: purchases, error: purchasesError } = await supabase
    .from('drum_purchases')
    .select('*')
    .limit(1);
    
  if (purchasesError) {
    console.error('drum_purchases error:', purchasesError.message);
  } else {
    console.log('drum_purchases columns:', Object.keys(purchases[0] || {}));
  }
}

checkTables().catch(console.error);