const { createClient } = require('@supabase/supabase-js');

const url = 'https://vqkoxfenyjomillmxawh.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa294ZmVueWpvbWlsbG14YXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1Njg1MCwiZXhwIjoyMDY2NTMyODUwfQ.3k5UI5onZyHvD9aSxV68wz2laDkv3GskKWKg_CgWdCw';

const supabase = createClient(url, serviceKey);

async function fixTableSchema() {
  console.log('Adding missing columns to drum_profiles table...');
  
  try {
    // Add current_module column
    const addCurrentModule = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE drum_profiles ADD COLUMN IF NOT EXISTS current_module INTEGER DEFAULT 1;'
    });
    
    if (addCurrentModule.error) {
      console.error('Error adding current_module column:', addCurrentModule.error.message);
    } else {
      console.log('Added current_module column');
    }
    
    // Add module_started_at column  
    const addModuleStartedAt = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE drum_profiles ADD COLUMN IF NOT EXISTS module_started_at TIMESTAMP WITH TIME ZONE;'
    });
    
    if (addModuleStartedAt.error) {
      console.error('Error adding module_started_at column:', addModuleStartedAt.error.message);
    } else {
      console.log('Added module_started_at column');
    }
    
    console.log('Schema update complete!');
    
    // Verify the updated schema
    console.log('Verifying updated schema...');
    const { data: profiles, error: profilesError } = await supabase
      .from('drum_profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.error('Verification error:', profilesError.message);
    } else {
      console.log('Updated drum_profiles columns:', Object.keys(profiles[0] || {}));
    }
    
  } catch (error) {
    console.error('Failed to update schema:', error);
  }
}

fixTableSchema().catch(console.error);