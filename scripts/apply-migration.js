const fetch = require('node-fetch');

const SUPABASE_URL = 'https://vqkoxfenyjomillmxawh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1Njg1MCwiZXhwIjoyMDY2NTMyODUwfQ.3k5UI5onZyHvD9aSxV68wz2laDkv3GskKWKg_CgWdCw';

async function applyMigration() {
  console.log('Applying migration to add missing columns...');
  
  const sql1 = 'ALTER TABLE public.drum_profiles ADD COLUMN IF NOT EXISTS current_module INTEGER DEFAULT 1 NOT NULL;';
  const sql2 = 'ALTER TABLE public.drum_profiles ADD COLUMN IF NOT EXISTS module_started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;';
  
  try {
    // Use the REST API to execute SQL
    const response1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        sql: sql1
      })
    });
    
    if (!response1.ok) {
      console.log(`SQL 1 response status: ${response1.status}`);
      const text = await response1.text();
      console.log('SQL 1 response:', text);
    } else {
      console.log('Added current_module column');
    }
    
    const response2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        sql: sql2
      })
    });
    
    if (!response2.ok) {
      console.log(`SQL 2 response status: ${response2.status}`);
      const text = await response2.text();
      console.log('SQL 2 response:', text);
    } else {
      console.log('Added module_started_at column');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
  
  // Verify the changes
  console.log('Verifying changes...');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('drum_profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Verification error:', error.message);
  } else {
    console.log('Updated columns:', Object.keys(data[0] || {}));
  }
}

applyMigration().catch(console.error);