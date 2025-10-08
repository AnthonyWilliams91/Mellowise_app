import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📦 Reading migration file...');
  const migrationPath = join(process.cwd(), 'supabase/migrations/020_waitlist_system.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Executing migration...');
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: migrationSQL
  });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration completed successfully!');
  console.log('📊 Testing functions...');

  // Test get_current_tier function
  const { data: tierData, error: tierError } = await supabase.rpc('get_current_tier', {
    total_signups: 0
  });

  if (tierError) {
    console.error('❌ Function test failed:', tierError);
  } else {
    console.log('✅ get_current_tier(0):', tierData);
  }

  // Test get_tier_by_position function
  const { data: posTierData, error: posTierError } = await supabase.rpc('get_tier_by_position', {
    pos: 1
  });

  if (posTierError) {
    console.error('❌ Function test failed:', posTierError);
  } else {
    console.log('✅ get_tier_by_position(1):', posTierData);
  }

  process.exit(0);
}

runMigration();
