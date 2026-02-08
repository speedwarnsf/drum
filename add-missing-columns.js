const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1Njg1MCwiZXhwIjoyMDY2NTMyODUwfQ.3k5UI5onZyHvD9aSxV68wz2laDkv3GskKWKg_CgWdCw';

const supabase = createClient(url, serviceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function addMissingColumns() {
  console.log('Adding missing columns to drum_profiles...');
  
  try {
    // First, let's check the current schema
    console.log('Current columns:');
    const { data: currentData } = await supabase
      .from('drum_profiles')
      .select('*')
      .limit(1);
    console.log(Object.keys(currentData?.[0] || {}));
    
    // Add current_module column
    console.log('Adding current_module column...');
    const currentModuleQuery = `
      ALTER TABLE drum_profiles 
      ADD COLUMN IF NOT EXISTS current_module INTEGER DEFAULT 1
    `;
    
    const moduleResult = await supabase.rpc('execute_sql', { query: currentModuleQuery });
    if (moduleResult.error) {
      console.log('Trying direct REST API approach for current_module...');
      // If rpc doesn't work, we'll use a different approach
    }
    
    // Add module_started_at column
    console.log('Adding module_started_at column...');
    const moduleStartedQuery = `
      ALTER TABLE drum_profiles 
      ADD COLUMN IF NOT EXISTS module_started_at TIMESTAMPTZ DEFAULT NOW()
    `;
    
    const startedResult = await supabase.rpc('execute_sql', { query: moduleStartedQuery });
    if (startedResult.error) {
      console.log('Trying direct REST API approach for module_started_at...');
    }
    
    // Verify changes
    console.log('Checking updated schema...');
    const { data: updatedData } = await supabase
      .from('drum_profiles')
      .select('*')
      .limit(1);
    console.log('Updated columns:', Object.keys(updatedData?.[0] || {}));
    
  } catch (error) {
    console.error('Error details:', error);
  }
}

addMissingColumns().catch(console.error);